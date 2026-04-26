"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { useRef, useState, useEffect } from "react";

type ImageComponentProps = {
  imageId: string | null;
  alt: string;
  size?: "compact" | "full";
  showRemove?: boolean;
  onRemove?: () => void;
  onUploadSuccess?: (imageId: string) => void;
};

export default function ImageComponent({
  imageId,
  alt,
  size = "compact",
  showRemove = false,
  onRemove,
  onUploadSuccess,
}: ImageComponentProps) {
  const [hasError, setHasError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHasError(false);
  }, [imageId]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const dimensions = size === "full" ? { width: 128, height: 128 } : { width: 40, height: 40 };
  const sizeClass = size === "full" ? "w-32 h-32" : "w-10 h-10";
  const iconSize = size === "full" ? 48 : 20;

  const showFallback = !imageId || hasError;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/profile-picture", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (response.ok) {
        const data = (await response.json()) as { imageId?: string };
        if (data.imageId) {
          onUploadSuccess?.(data.imageId);
        } else {
          setUploadError("Upload failed. Please try again.");
        }
      } else {
        const errorText = await response.text();
        setUploadError(errorText || "Upload failed. Please try again.");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      {showFallback ? (
        <div
          className={`flex items-center justify-center rounded-full bg-gray-700 ${sizeClass}`}
          aria-label={alt}
          role="img"
        >
          <User size={iconSize} className="text-gray-400" />
        </div>
      ) : (
        <Image
          src={`/api/images/${imageId}`}
          unoptimized
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className={`rounded-full object-cover ${sizeClass}`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            setHasError(true);
          }}
        />
      )}

      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
          aria-label="Remove profile picture"
        >
          Remove
        </button>
      )}

      {onUploadSuccess && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            aria-label="Upload profile picture"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {uploadError && (
        <p role="alert" className="text-red-400 text-sm mt-1">
          {uploadError}
        </p>
      )}
    </div>
  );
}

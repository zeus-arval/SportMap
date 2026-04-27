"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X } from "lucide-react";

interface PhotoUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function PhotoUpload({
  images,
  onChange,
  maxImages = 4,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) return;

    setUploading(true);

    // For now, create local URLs - replace with actual upload logic
    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const url = URL.createObjectURL(files[i]);
      newImages.push(url);
    }

    onChange([...images, ...newImages]);
    setUploading(false);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [images, onChange, maxImages]);

  const removeImage = (index: number) => {
    const newImages = [...images];
    const removed = newImages.splice(index, 1);
    // Revoke object URL to prevent memory leaks
    if (removed[0]?.startsWith("blob:")) {
      URL.revokeObjectURL(removed[0]);
    }
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-green-500/30 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Camera size={20} className="text-gray-400" />
              </div>
              <span className="text-gray-500 text-xs">
                Add photos ({images.length}/{maxImages})
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
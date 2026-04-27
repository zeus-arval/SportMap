"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import PhotoUpload from "@/components/ui/PhotoUpload";

interface CreatePostSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePostSheet({
  open,
  onClose,
  onCreated,
}: CreatePostSheetProps) {
  const currentUser = useCurrentUser();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!currentUser) {
      setError("You must be logged in to create a post");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (!placeId.trim()) {
      setError("Please select a place");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          placeId: placeId.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      setTitle("");
      setContent("");
      setPlaceId("");
      setSubmitting(false);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      setSubmitting(false);
    }
  }, [currentUser, title, content, placeId, onCreated, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 35,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed bottom-0 left-0 right-0 mx-auto bg-[#12121a] rounded-t-3xl border-t border-white/10 z-50 max-h-[85vh] overflow-y-auto max-w-lg"
          >
            {/* Handle */}
            <div className="sticky top-0 bg-[#12121a] z-20 pt-4 pb-2 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto" />
            </div>

            <div className="px-6 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Camera size={20} className="text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">New Post</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Place ID */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Place
                  </label>
                  <input
                    type="text"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    placeholder="Enter place ID"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    <Camera size={12} className="inline mr-1.5" />
                    Photos (optional)
                  </label>
                  <PhotoUpload images={images} onChange={setImages} maxImages={4} />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Post"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
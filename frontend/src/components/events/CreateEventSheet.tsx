"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, AlignLeft, Users } from "lucide-react";
import { eventService } from "@/services/event.service";
import { placeService } from "@/services/place.service";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { CreateEventData } from "@/types/event";
import type { SelectedPlace } from "@/types/place";
import { isPendingPlace } from "@/types/place";
import PlacePicker from "./PlacePicker";

interface CreateEventSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateEventSheet({
  open,
  onClose,
  onCreated,
}: CreateEventSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [startTime, setStartTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useCurrentUser();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedPlace(null);
    setStartTime("");
    setCapacity("");
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!selectedPlace) {
      setError("Please select a place");
      return;
    }
    if (!startTime) {
      setError("Start time is required");
      return;
    }

    const startDate = new Date(startTime);
    if (startDate <= new Date()) {
      setError("Start time must be in the future");
      return;
    }

    setSubmitting(true);

    // If the place is pending (new), create it first
    let placeId: string;
    if (isPendingPlace(selectedPlace)) {
      const placeResult = await placeService.createPlace({
        name: selectedPlace.name,
        description: selectedPlace.description,
        placeTypeId: selectedPlace.placeTypeId,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        creatorId: selectedPlace.creatorId,
      });

      if (!placeResult.isSucceed || !placeResult.value) {
        setError(placeResult.error?.message ?? "Failed to create place");
        setSubmitting(false);
        return;
      }
      placeId = placeResult.value.id;
    } else {
      placeId = selectedPlace.id;
    }

    const dto: CreateEventData = {
      placeId,
      title: title.trim(),
      description: description.trim() || null,
      startTime: startDate.toISOString(),
      capacity: capacity ? parseInt(capacity, 10) : null,
    };

    const result = await eventService.create(dto);
    setSubmitting(false);

    if (!result.isSucceed) {
      setError(result.error?.message ?? "Failed to create event");
      return;
    }

    resetForm();
    onCreated();
    onClose();
  };

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
            className="fixed bottom-0 left-0 right-0 bg-[#12121a] rounded-t-3xl border-t border-white/10 z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="sticky top-0 bg-[#12121a] z-20 pt-4 pb-2 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto" />
            </div>

            <div className="px-6 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Event</h2>
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
                  <label className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                    <AlignLeft size={12} className="mr-1.5" />
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning Run at Toompark"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Place */}
                <div>
                  <label className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                    Place
                  </label>
                  <PlacePicker
                    value={selectedPlace}
                    onChange={setSelectedPlace}
                    creatorId={currentUser?.id}
                  />
                </div>

                {/* Start time */}
                <div>
                  <label className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                    <Calendar size={12} className="mr-1.5" />
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                    <AlignLeft size={12} className="mr-1.5" />
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people what the event is about..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="flex items-center text-gray-400 text-xs font-medium mb-1.5">
                    <Users size={12} className="mr-1.5" />
                    Capacity (optional)
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

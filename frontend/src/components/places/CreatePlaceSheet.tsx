"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check, Map, Camera } from "lucide-react";
import { placeService } from "@/services/place.service";
import { placeTypeService, type PlaceTypeDto } from "@/services/place-type.service";
import { useCurrentUser } from "@/hooks/use-current-user";
import MapPickerSheet from "@/components/events/MapPickerSheet";
import type { SelectedPlace, PendingPlace } from "@/types/place";
import { isPendingPlace } from "@/types/place";
import PhotoUpload from "@/components/ui/PhotoUpload";
import MapPreview from "@/components/ui/MapPreview";

interface CreatePlaceSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: (placeId: string) => void;
}

export default function CreatePlaceSheet({
  open,
  onClose,
  onCreated,
}: CreatePlaceSheetProps) {
  const currentUser = useCurrentUser();

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [description, setDescription] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // UI state
  const [placeTypes, setPlaceTypes] = useState<PlaceTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch place types
  useEffect(() => {
    if (!open) return;
    const fetchTypes = async () => {
      const result = await placeTypeService.getAll();
      if (result.isSucceed && result.value) {
        setPlaceTypes(result.value);
        if (result.value.length > 0) {
          setSelectedTypeId(result.value[0].id);
        }
      }
      setLoading(false);
    };
    void fetchTypes();
  }, [open]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setName("");
      setAddress("");
      setSelectedPlace(null);
      setDescription("");
      setImages([]);
      setError(null);
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!currentUser) {
      setError("You must be logged in to create a place");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!selectedPlace) {
      setError("Please pick a location on the map");
      return;
    }

    if (!selectedTypeId) {
      setError("Please select a sport type");
      return;
    }

    setSubmitting(true);
    setError(null);

    let placeId: string;

    if (isPendingPlace(selectedPlace)) {
      const placeResult = await placeService.createPlace({
        name: name.trim(),
        description: description.trim(),
        placeTypeId: selectedTypeId,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        address: address.trim() || undefined,
        creatorId: currentUser.id,
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

    setSubmitting(false);
    onCreated(placeId);
    onClose();
  }, [currentUser, name, address, description, selectedTypeId, selectedPlace, onCreated, onClose]);

  // Extract coordinates from selected place
  const coords = selectedPlace ? {
    lat: isPendingPlace(selectedPlace) ? selectedPlace.latitude : selectedPlace.latitude,
    lng: isPendingPlace(selectedPlace) ? selectedPlace.longitude : selectedPlace.longitude,
  } : null;

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
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MapPin size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Add Place</h2>
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
                {/* Name */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Stadium, Gym, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-green-500/50 transition-colors"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Address (optional)
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Sports Street"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 outline-none focus:border-green-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Location
                  </label>
                  {coords ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <MapPreview
                          latitude={coords.lat}
                          longitude={coords.lng}
                          className="h-36 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlace(null);
                            setAddress("");
                          }}
                          className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-green-500/30 rounded-xl px-4 py-2">
                        <MapPin size={14} className="text-green-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {selectedPlace?.name}
                            {isPendingPlace(selectedPlace!) && (
                              <span className="ml-1.5 text-xs text-yellow-400/70 font-normal">(new)</span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMapPickerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-gray-400 text-sm hover:border-green-500/30 hover:text-green-400 transition-colors"
                    >
                      <Map size={16} />
                      Pick a location on the map
                    </button>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this location..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-green-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Sports */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Sports
                  </label>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {placeTypes.map((type) => {
                        const isSelected = selectedTypeId === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setSelectedTypeId(type.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-green-500/20 border-green-500/50 text-green-400"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            <span className="text-xs font-medium text-center">{type.name}</span>
                            {isSelected && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Add Place"}
              </button>
            </div>
          </motion.div>

          {/* Map Picker */}
          <MapPickerSheet
            open={mapPickerOpen}
            onClose={() => setMapPickerOpen(false)}
            onPlacePicked={(place: SelectedPlace) => {
              setSelectedPlace(place);
              // If it's a pending place with an address, populate the address field
              if (isPendingPlace(place) && place.address) {
                setAddress(place.address);
              }
              setMapPickerOpen(false);
            }}
            creatorId={currentUser?.id ?? "00000000-0000-0000-0000-000000000001"}
            coordinatesOnly={true}
          />
        </>
      )}
    </AnimatePresence>
  );
}
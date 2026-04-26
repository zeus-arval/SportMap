"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Check } from "lucide-react";
import type { PlaceDto, PlaceTypeDto, PendingPlace, SelectedPlace } from "@/types/place";
import { placeService } from "@/services/place.service";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPlacePicked: (place: SelectedPlace) => void;
  creatorId: string;
}

const TALLINN_CENTER: [number, number] = [24.7421, 59.4379];

export default function MapPickerSheet({
  open,
  onClose,
  onPlacePicked,
  creatorId,
}: MapPickerSheetProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newPinMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placeMarkersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapboxRef = useRef<any>(null);

  const [mode, setMode] = useState<"idle" | "existing" | "new">("idle");
  const [selectedExisting, setSelectedExisting] = useState<PlaceDto | null>(
    null
  );
  const [pickedCoords, setPickedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [placeTypes, setPlaceTypes] = useState<PlaceTypeDto[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load place types
  useEffect(() => {
    if (!open) return;
    fetch("/api/place-types")
      .then((r) => (r.ok ? r.json() : []))
      .then((types: PlaceTypeDto[]) => {
        setPlaceTypes(types);
        if (types.length > 0) setSelectedTypeId(types[0].id);
      })
      .catch(() => {});
  }, [open]);

  // Init map when sheet opens
  useEffect(() => {
    if (!open || !mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxRef.current = mapboxgl;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token || !mapRef.current) return;

      mapboxgl.accessToken = token;

      map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: TALLINN_CENTER,
        zoom: 12,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Load existing places and add markers — matching MapView style
      map.on("load", async () => {
        const result = await placeService.getAll();
        if (result.isSucceed && result.value) {
          result.value.forEach((place: PlaceDto) => {
            const el = document.createElement("div");
            el.className = "custom-marker";
            el.style.width = "30px";
            el.style.height = "30px";
            el.style.backgroundColor = "#a855f7";
            el.style.borderRadius = "50%";
            el.style.border = "2px solid #fff";
            el.style.cursor = "pointer";
            el.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

            el.addEventListener("click", (e) => {
              e.stopPropagation();
              // Clear any new-pin marker
              if (newPinMarkerRef.current) {
                newPinMarkerRef.current.remove();
                newPinMarkerRef.current = null;
              }
              setPickedCoords(null);
              setPlaceName("");
              setSelectedExisting(place);
              setMode("existing");
              setError(null);
            });

            const marker = new mapboxgl.Marker(el)
              .setLngLat([place.longitude, place.latitude])
              .addTo(map);
            placeMarkersRef.current.push(marker);
          });
        }
      });

      // Click on empty map → new pin mode
      map.on("click", (e: { lngLat: { lat: number; lng: number } }) => {
        const { lat, lng } = e.lngLat;
        setSelectedExisting(null);
        setPickedCoords({ lat, lng });
        setMode("new");
        setError(null);

        if (newPinMarkerRef.current) {
          newPinMarkerRef.current.setLngLat([lng, lat]);
        } else {
          const el = document.createElement("div");
          el.style.width = "20px";
          el.style.height = "20px";
          el.style.backgroundColor = "#3b82f6";
          el.style.borderRadius = "50%";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 0 10px rgba(59,130,246,0.6)";

          newPinMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map);
        }
      });
    };

    initMap();

    return () => {
      placeMarkersRef.current.forEach((m) => m.remove());
      placeMarkersRef.current = [];
      if (newPinMarkerRef.current) {
        newPinMarkerRef.current.remove();
        newPinMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setPickedCoords(null);
      setPlaceName("");
      setSelectedExisting(null);
      setMode("idle");
      setError(null);
    };
  }, [open]);

  const handleConfirm = () => {
    if (mode === "existing" && selectedExisting) {
      onPlacePicked(selectedExisting);
      onClose();
      return;
    }

    if (mode === "new") {
      if (!pickedCoords) {
        setError("Tap on the map to pick a location");
        return;
      }
      if (!placeName.trim()) {
        setError("Enter a name for this place");
        return;
      }
      if (!selectedTypeId) {
        setError("Select a place type");
        return;
      }

      const pending: PendingPlace = {
        pending: true,
        name: placeName.trim(),
        description: `Event location at ${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)}`,
        placeTypeId: selectedTypeId,
        latitude: pickedCoords.lat,
        longitude: pickedCoords.lng,
        creatorId,
      };

      onPlacePicked(pending);
      onClose();
    }
  };

  const confirmDisabled =
    mode === "idle" ||
    (mode === "new" && (!pickedCoords || !placeName.trim())) ||
    (mode === "existing" && !selectedExisting);

  const confirmLabel =
    mode === "existing"
      ? `Use ${selectedExisting?.name ?? "Place"}`
      : "Use Location";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[60]"
          />

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
            className="fixed inset-0 z-[61] flex flex-col bg-[#0a0a0f]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#12121a] border-b border-white/10">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-white font-semibold text-sm">
                Pick Location
              </h2>
              <div className="w-[34px]" />
            </div>

            {/* Map */}
            <div ref={mapRef} className="flex-1" />

            {/* Bottom panel */}
            <div className="bg-[#12121a] border-t border-white/10 px-4 py-4 space-y-3">
              {mode === "existing" && selectedExisting && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {selectedExisting.name}
                    </p>
                    {selectedExisting.address && (
                      <p className="text-gray-500 text-xs truncate">
                        {selectedExisting.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {mode === "new" && pickedCoords && (
                <>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} className="text-blue-400" />
                    <span>
                      {pickedCoords.lat.toFixed(5)},{" "}
                      {pickedCoords.lng.toFixed(5)}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="Name this place (e.g. Kadriorg Park)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
                  />

                  {placeTypes.length > 0 && (
                    <select
                      value={selectedTypeId}
                      onChange={(e) => setSelectedTypeId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]"
                    >
                      {placeTypes.map((pt) => (
                        <option key={pt.id} value={pt.id} className="bg-[#1a1a2e] text-white">
                          {pt.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              {mode === "idle" && (
                <p className="text-gray-500 text-sm text-center py-2">
                  Tap an existing place or pick a new spot on the map
                </p>
              )}

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}

              <button
                onClick={handleConfirm}
                disabled={confirmDisabled}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check size={16} />
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

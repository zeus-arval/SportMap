"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Crown,
} from "lucide-react";
import type { EventData } from "@/types/event";
import { eventService } from "@/services/event.service";
import { placeService } from "@/services/place.service";
import { formatFullDate, formatTime, formatJoinDate, getTimeUntilLong } from "@/lib/date";
import { haversineKm, formatDistanceKm } from "@/lib/distance";
import { useCurrentUser } from "@/hooks/use-current-user";

interface EventDetailSheetProps {
  eventId: string | null;
  onClose: () => void;
  onChanged?: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

interface PlaceInfo {
  name: string;
  latitude: number;
  longitude: number;
}

export default function EventDetailSheet({
  eventId,
  onClose,
  onChanged,
  userLocation,
}: EventDetailSheetProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const currentUser = useCurrentUser();

  const hasJoined =
    !!currentUser?.id &&
    !!event?.participants?.some((p) => p.userId === currentUser.id);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setPlace(null);
      setActionError(null);
      return;
    }

    setLoading(true);
    eventService.getById(eventId).then(async (result) => {
      if (result.value) {
        setEvent(result.value);

        // Fetch place data for the mini map
        const placeResult = await placeService.getById(result.value.placeId);
        if (placeResult.value) {
          setPlace({
            name: placeResult.value.name,
            latitude: placeResult.value.latitude,
            longitude: placeResult.value.longitude,
          });
        }
      }
      setLoading(false);
    });
  }, [eventId]);

  const handleAction = async (action: "join" | "leave") => {
    if (!eventId) return;
    setActionLoading(true);
    setActionError(null);
    const result = action === "join"
      ? await eventService.join(eventId)
      : await eventService.leave(eventId);
    if (result.isSucceed) {
      const updated = await eventService.getById(eventId);
      if (updated.value) setEvent(updated.value);
      onChanged?.();
    } else {
      setActionError(result.message ?? `Failed to ${action} event`);
    }
    setActionLoading(false);
  };

  const handleJoin = () => handleAction("join");
  const handleLeave = () => handleAction("leave");

  // Initialize mini map when place coordinates are available
  useEffect(() => {
    if (!place || !miniMapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token || !miniMapRef.current) return;

      mapboxgl.accessToken = token;

      map = new mapboxgl.Map({
        container: miniMapRef.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [place.longitude, place.latitude],
        zoom: 14,
        interactive: false,
        attributionControl: false,
      });

      map.on("load", () => {
        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.backgroundColor = "#3b82f6";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid #fff";
        el.style.boxShadow = "0 0 10px rgba(59,130,246,0.6)";

        new mapboxgl.Marker(el)
          .setLngLat([place.longitude, place.latitude])
          .addTo(map!);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [place]);

  if (!eventId) return null;

  const isUpcoming = event ? new Date(event.startTime) > new Date() : false;

  const distanceKm =
    userLocation && place
      ? haversineKm(userLocation.lat, userLocation.lng, place.latitude, place.longitude)
      : null;

  return (
    <AnimatePresence>
      <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Bottom Sheet */}
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
            className="absolute bottom-0 left-0 right-0 bg-[#12121a] rounded-t-3xl border-t border-white/10 z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="sticky top-0 bg-[#12121a] z-20 pt-4 pb-2 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto" />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && event && (
              <>
                {/* Mini Map */}
                {place ? (
                  <div className="relative h-44 w-full">
                    <div ref={miniMapRef} className="w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent pointer-events-none" />
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="relative h-32 w-full bg-white/5 flex items-center justify-center">
                    <MapPin size={32} className="text-gray-600" />
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <div className="px-6 pb-8 relative z-10">
                  {/* Time-until badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                        isUpcoming
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {getTimeUntilLong(event.startTime)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {event.title}
                  </h2>

                  {/* Location */}
                  {place && (
                    <div className="flex items-center text-gray-400 text-sm mb-4">
                      <MapPin size={14} className="mr-1.5 text-blue-400 shrink-0" />
                      <span>{place.name}</span>
                      {distanceKm !== null && (
                        <span className="ml-2 text-purple-400/80 text-xs">
                          {formatDistanceKm(distanceKm)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date & Time cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl border border-white/5 p-3">
                      <div className="flex items-center text-gray-500 text-xs mb-1">
                        <Calendar size={12} className="mr-1" />
                        Date
                      </div>
                      <p className="text-white text-sm font-medium">
                        {formatFullDate(event.startTime)}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/5 p-3">
                      <div className="flex items-center text-gray-500 text-xs mb-1">
                        <Clock size={12} className="mr-1" />
                        Time
                      </div>
                      <p className="text-white text-sm font-medium">
                        {formatTime(event.startTime)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        About
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Host & Capacity info */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl border border-white/5 p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                        <Crown size={16} className="text-yellow-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-500 text-xs">Host</p>
                        <p className="text-white text-sm font-medium truncate">
                          {event.hostUserName || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl border border-white/5 p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Users size={16} className="text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-500 text-xs">Participants</p>
                        <p className="text-white text-sm font-medium">
                          {event.participantCount}
                          {event.capacity ? ` / ${event.capacity}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Participants list */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                      <Users size={14} className="mr-1.5" />
                      Attendees
                      {event.participantCount > 0 && (
                        <span className="ml-auto text-blue-400 text-xs font-normal">
                          {event.participantCount} going
                        </span>
                      )}
                    </h3>

                    {event.participants && event.participants.length > 0 ? (
                      <div className="space-y-2">
                        {event.participants.map((p) => (
                          <div
                            key={p.userId}
                            className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                              <User size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {p.userName || "Anonymous"}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Joined {formatJoinDate(p.joinedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm py-4 text-center bg-white/5 rounded-xl border border-white/5">
                        No one has joined yet — be the first!
                      </div>
                    )}
                  </div>

                  {/* Action error */}
                  {actionError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {actionError}
                    </div>
                  )}

                  {/* Join / Leave button */}
                  {isUpcoming && (
                    <div>
                      {hasJoined ? (
                        <button
                          onClick={handleLeave}
                          disabled={actionLoading}
                          className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? "…" : "Leave Event"}
                        </button>
                      ) : (
                        <button
                          onClick={handleJoin}
                          disabled={actionLoading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {actionLoading ? "…" : "Join Event"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
          </>
        </AnimatePresence>
  );
}

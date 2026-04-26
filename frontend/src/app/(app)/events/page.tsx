"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Calendar, MapPin, Plus } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import EventDetailSheet from "@/components/events/EventDetailSheet";
import CreateEventSheet from "@/components/events/CreateEventSheet";
import EventFilterBar from "@/components/events/EventFilterBar";
import { eventService } from "@/services/event.service";
import { placeService } from "@/services/place.service";
import { useCurrentUser } from "@/hooks/use-current-user";
import { haversineKm } from "@/lib/distance";
import type { EventData, EventFilters } from "@/types/event";

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const placeMapRef = useRef<Record<string, { latitude: number; longitude: number }>>({});
  const [placeMap, setPlaceMap] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const currentUser = useCurrentUser();
  const geoFetchedRef = useRef(false);

  const error = actionError ?? fetchError;

  // Auto-fetch user location once on mount
  useEffect(() => {
    if (geoFetchedRef.current || !navigator.geolocation) return;
    geoFetchedRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: Math.round(pos.coords.latitude * 1e6) / 1e6,
          lng: Math.round(pos.coords.longitude * 1e6) / 1e6,
        });
      },
      () => { /* user denied — no location, no distance */ }
    );
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const result = await eventService.getFiltered(filters);
    if (result.isSucceed && result.value) {
      setEvents(result.value);

      // Fetch place coordinates for distance computation
      const placeIds = [...new Set(result.value.map((e) => e.placeId))];
      const missing = placeIds.filter((id) => !placeMapRef.current[id]);

      if (missing.length > 0) {
        const fetches = missing.map(async (id) => {
          const placeResult = await placeService.getById(id);
          if (placeResult.value) {
            placeMapRef.current[id] = {
              latitude: placeResult.value.latitude,
              longitude: placeResult.value.longitude,
            };
          }
        });
        await Promise.all(fetches);
        setPlaceMap({ ...placeMapRef.current });
      }
    } else {
      setEvents([]);
      setFetchError(result.error?.message ?? "Failed to load events");
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const handleEventAction = useCallback(
    async (eventId: string, action: "join" | "leave") => {
      setActionError(null);
      const result = action === "join"
        ? await eventService.join(eventId)
        : await eventService.leave(eventId);
      if (result.isSucceed) {
        await fetchEvents();
      } else {
        setActionError(result.message ?? `Failed to ${action} event`);
      }
    },
    [fetchEvents]
  );

  const handleJoin = useCallback(
    (eventId: string) => handleEventAction(eventId, "join"),
    [handleEventAction]
  );

  const handleLeave = useCallback(
    (eventId: string) => handleEventAction(eventId, "leave"),
    [handleEventAction]
  );

  const handleCreated = useCallback(async () => {
    setActionError(null);
    await fetchEvents();
  }, [fetchEvents]);

  const getDistanceKm = (placeId: string): number | null => {
    if (!userLocation) return null;
    const coords = placeMap[placeId];
    if (!coords) return null;
    return haversineKm(userLocation.lat, userLocation.lng, coords.latitude, coords.longitude);
  };

  return (
    <div className="h-full w-full bg-[#0a0a0f] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Events</h1>
              <p className="text-gray-500 text-xs">
                Upcoming activities near you
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            New Event
          </button>
        </div>

        {/* Filter bar */}
        <EventFilterBar filters={filters} onFiltersChange={setFilters} />

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Events list */}
        {!loading && events && events.length > 0 && (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={currentUser?.id}
                distanceKm={getDistanceKm(event.placeId)}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onClick={() => setSelectedEventId(event.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && (!events || events.length === 0) && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MapPin size={28} className="text-gray-600" />
            </div>
            <h2 className="text-white font-semibold mb-1">No events found</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-4">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters or expanding the search area."
                : "Be the first to organize something — tap the button above to create an event."}
            </p>
          </div>
        )}
      </div>

      {/* Create event bottom sheet */}
      <CreateEventSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      {/* Event detail bottom sheet */}
      <EventDetailSheet
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
        onChanged={fetchEvents}
        userLocation={userLocation}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, X, SlidersHorizontal, Navigation } from "lucide-react";
import type { EventFilters } from "@/types/event";
import { utcToLocalInput, localInputToUTC, DATE_PRESETS } from "@/lib/date";

const RADIUS_OPTIONS = [1, 2, 5, 10, 25, 50];

interface EventFilterBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

export default function EventFilterBar({
  filters,
  onFiltersChange,
}: EventFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const mapPickerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const hasLocationFilter = filters.lat !== undefined && filters.lng !== undefined;
  const hasDateFilter = !!filters.dateFrom || !!filters.dateTo;
  const activeCount = (hasLocationFilter ? 1 : 0) + (hasDateFilter ? 1 : 0);

  // Reverse geocode to get a label
  useEffect(() => {
    if (!filters.lat || !filters.lng) {
      setLocationLabel(null);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${filters.lng},${filters.lat}.json?access_token=${token}&types=place,locality,neighborhood&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.features?.length > 0) {
          setLocationLabel(data.features[0].place_name?.split(",")[0] ?? "Selected location");
        } else {
          setLocationLabel("Selected location");
        }
      })
      .catch(() => setLocationLabel("Selected location"));
  }, [filters.lat, filters.lng]);

  // Mini map picker
  useEffect(() => {
    if (!showMapPicker || !mapPickerRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let marker: any = null;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token || !mapPickerRef.current) return;

      mapboxgl.accessToken = token;

      const center: [number, number] = filters.lng && filters.lat
        ? [filters.lng, filters.lat]
        : [24.7536, 59.437]; // Tallinn default

      map = new mapboxgl.Map({
        container: mapPickerRef.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center,
        zoom: 11,
        attributionControl: false,
      });

      const el = document.createElement("div");
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.backgroundColor = "#8b5cf6";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid #fff";
      el.style.boxShadow = "0 0 12px rgba(139,92,246,0.6)";

      marker = new mapboxgl.Marker(el).setLngLat(center).addTo(map);

      map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        onFiltersChange({
          ...filters,
          lat: Math.round(e.lngLat.lat * 1e6) / 1e6,
          lng: Math.round(e.lngLat.lng * 1e6) / 1e6,
          radiusKm: filters.radiusKm ?? 5,
        });
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
    // Only re-init when the map opens/closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapPicker]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onFiltersChange({
          ...filters,
          lat: Math.round(pos.coords.latitude * 1e6) / 1e6,
          lng: Math.round(pos.coords.longitude * 1e6) / 1e6,
          radiusKm: filters.radiusKm ?? 5,
        });
        setLocating(false);
        setShowMapPicker(false);
      },
      () => setLocating(false)
    );
  };

  const clearLocation = () => {
    const { lat, lng, radiusKm, ...rest } = filters;
    onFiltersChange(rest);
    setShowMapPicker(false);
  };

  const clearDate = () => {
    const { dateFrom, dateTo, ...rest } = filters;
    onFiltersChange(rest);
    setActivePreset(null);
  };

  const clearAll = () => {
    onFiltersChange({});
    setShowMapPicker(false);
    setExpanded(false);
    setActivePreset(null);
  };

  return (
    <div className="mb-4">
      {/* Collapsed: pill toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeCount > 0
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Active filter chips */}
        {hasLocationFilter && !expanded && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">
            <MapPin size={11} />
            {locationLabel ?? "Location"} · {filters.radiusKm ?? 5}km
            <button onClick={clearLocation} className="ml-0.5 hover:text-white">
              <X size={11} />
            </button>
          </span>
        )}
        {hasDateFilter && !expanded && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">
            <Calendar size={11} />
            Date
            <button onClick={clearDate} className="ml-0.5 hover:text-white">
              <X size={11} />
            </button>
          </span>
        )}

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="mt-3 bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
          {/* --- Location Section --- */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <MapPin size={12} className="mr-1.5 text-purple-400" />
              Location
            </h4>

            <div className="flex gap-2 mb-2">
              <button
                onClick={handleUseMyLocation}
                disabled={locating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  hasLocationFilter
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                }`}
              >
                <Navigation size={12} />
                {locating ? "Locating…" : "My location"}
              </button>
              <button
                onClick={() => setShowMapPicker(!showMapPicker)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  showMapPicker
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                }`}
              >
                <MapPin size={12} />
                Pick on map
              </button>
              {hasLocationFilter && (
                <button
                  onClick={clearLocation}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-500 text-xs border border-white/10 hover:text-white transition-colors"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>

            {/* Map picker */}
            {showMapPicker && (
              <div
                ref={mapPickerRef}
                className="w-full h-40 rounded-xl overflow-hidden border border-white/10 mb-2"
              />
            )}

            {/* Radius pills */}
            {hasLocationFilter && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-14 shrink-0">Radius</span>
                <div className="flex gap-1.5 flex-1 flex-wrap">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => onFiltersChange({ ...filters, radiusKm: r })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        (filters.radiusKm ?? 5) === r
                          ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                          : "bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300"
                      }`}
                    >
                      {r}km
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasLocationFilter && locationLabel && (
              <p className="text-purple-400/60 text-xs mt-1.5">
                📍 {locationLabel} · {filters.radiusKm ?? 5}km radius
              </p>
            )}
          </div>

          {/* --- Date Section --- */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
              <Calendar size={12} className="mr-1.5 text-cyan-400" />
              When
            </h4>

            {/* Quick presets */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {DATE_PRESETS.map((preset) => {
                const isActive = activePreset === preset.label;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (isActive) {
                        clearDate();
                      } else {
                        const { from, to } = preset.getRange();
                        setActivePreset(preset.label);
                        onFiltersChange({ ...filters, dateFrom: from, dateTo: to });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
                        : "bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom date + time range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-500 text-xs mb-1 block">From</label>
                <input
                  type="datetime-local"
                  value={filters.dateFrom ? utcToLocalInput(filters.dateFrom) : ""}
                  onChange={(e) => {
                    setActivePreset(null);
                    onFiltersChange({
                      ...filters,
                      dateFrom: e.target.value ? localInputToUTC(e.target.value) : undefined,
                    });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block">To</label>
                <input
                  type="datetime-local"
                  value={filters.dateTo ? utcToLocalInput(filters.dateTo) : ""}
                  onChange={(e) => {
                    setActivePreset(null);
                    onFiltersChange({
                      ...filters,
                      dateTo: e.target.value ? localInputToUTC(e.target.value) : undefined,
                    });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                />
              </div>
            </div>

            {hasDateFilter && (
              <button
                onClick={clearDate}
                className="mt-2 flex items-center gap-1 text-gray-500 text-xs hover:text-gray-300 transition-colors"
              >
                <X size={11} />
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

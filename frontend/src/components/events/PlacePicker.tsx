"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Map } from "lucide-react";
import type { PlaceDto, SelectedPlace } from "@/types/place";
import { isPendingPlace } from "@/types/place";
import { placeService } from "@/services/place.service";
import MapPickerSheet from "./MapPickerSheet";

interface PlacePickerProps {
  value: SelectedPlace | null;
  onChange: (place: SelectedPlace | null) => void;
  creatorId?: string;
}

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function PlacePicker({
  value,
  onChange,
  creatorId,
}: PlacePickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await placeService.search(query.trim());
      if (res.value) {
        setResults(res.value);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (value) {
    const name = value.name;
    const address = isPendingPlace(value) ? null : value.address;
    return (
      <div className="flex items-center gap-2 bg-white/5 border border-blue-500/30 rounded-xl px-4 py-3">
        <MapPin size={14} className="text-blue-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {name}
            {isPendingPlace(value) && (
              <span className="ml-1.5 text-xs text-yellow-400/70 font-normal">(new)</span>
            )}
          </p>
          {address && (
            <p className="text-gray-500 text-xs truncate">{address}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a place..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                onChange(place);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <MapPin size={14} className="text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {place.name}
                </p>
                {place.address && (
                  <p className="text-gray-500 text-xs truncate">
                    {place.address}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-sm text-center">No places found</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setMapPickerOpen(true);
        }}
        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-gray-400 text-xs hover:border-blue-500/30 hover:text-blue-400 transition-colors"
      >
        <Map size={14} />
        Pick a new location on the map
      </button>

      <MapPickerSheet
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onPlacePicked={(place) => {
          onChange(place);
          setMapPickerOpen(false);
        }}
        creatorId={creatorId ?? SYSTEM_USER_ID}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { placeService } from '@/services/place.service';
import type { PlaceDto } from '@/types/place';

interface SearchBarProps {
  onPlaceSelect: (place: PlaceDto) => void;
}

export default function SearchBar({ onPlaceSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const justSelected = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        justSelected.current = false;
        return;
      }

      setIsLoading(true);
      const result = await placeService.search(query);
      if (result.isSucceed && result.value) {
        setResults(result.value);
        setIsOpen(result.value.length > 0 && !justSelected.current);
      }
      justSelected.current = false;
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceDto) => {
    setQuery(place.name);
    setIsOpen(false);
    justSelected.current = true;
    onPlaceSelect(place);
  };

  return (
    <div ref={wrapperRef} className="relative z-30">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search places..."
        className="w-64 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {isOpen && results.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{place.name}</div>
              <div className="text-xs text-gray-500">
                {place.placeType?.name}
                {place.address && ` • ${place.address}`}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isLoading && (
        <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-sm text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
}

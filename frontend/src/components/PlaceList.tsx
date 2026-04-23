'use client';

import React, { useState, useRef } from 'react';
import type { PlaceDto } from '@/types/place';
import { RefreshCw } from 'lucide-react';

interface PlaceListProps {
  places: PlaceDto[];
  onPlaceClick: (place: PlaceDto) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function PlaceList({ places, onPlaceClick, onRefresh, isRefreshing }: PlaceListProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onRefresh) return;
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onRefresh || startYRef.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    // Only trigger pull down when scrolled at top
    if (diff > 0 && listRef.current && listRef.current.scrollTop === 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60 && onRefresh) {
      onRefresh();
    }
    setPullDistance(0);
    startYRef.current = null;
  };

  if (places.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No places found
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      className="h-full overflow-y-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {onRefresh && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200"
          style={{ 
            height: '60px',
            transform: `translateY(${pullDistance}px)`,
            opacity: pullDistance / 60
          }}
        >
          <RefreshCw 
            className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      
      <div className="p-4 space-y-3" style={{ paddingTop: pullDistance > 20 ? '60px' : '16px' }}>
        {places.map((place) => (
          <div
            key={place.id}
            onClick={() => onPlaceClick(place)}
            className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {place.name}
                </h3>
                {place.placeType && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {place.placeType.name}
                  </span>
                )}
                {place.address && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {place.address}
                  </p>
                )}
                {place.description && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                    {place.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

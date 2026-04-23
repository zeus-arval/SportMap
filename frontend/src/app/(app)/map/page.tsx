'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import PlaceList from '@/components/PlaceList';
import { placeService } from '@/services/place.service';
import { placeTypeService } from '@/services/place-type.service';
import type { PlaceDto, PlaceTypeDto } from '@/types/place';
import SearchBar from '@/components/SearchBar';

// Dynamic import for MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
});

function MapContent() {
  const searchParams = useSearchParams();
  const placeIdFromUrl = searchParams.get('placeId');
  
  const [view, setView] = useState<'map' | 'list'>('map');
  const [places, setPlaces] = useState<PlaceDto[]>([]);
  const [placeTypes, setPlaceTypes] = useState<PlaceTypeDto[]>([]);
  const [selectedPlaceTypeId, setSelectedPlaceTypeId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);

  // Fetch place types
  useEffect(() => {
    async function fetchPlaceTypes() {
      const result = await placeTypeService.getAll();
      if (result.isSucceed && result.value) {
        setPlaceTypes(result.value);
      }
    }
    fetchPlaceTypes();
  }, []);
  
  // Fetch places
  const fetchPlaces = useCallback(async () => {
    if (!isRefreshing) setLoading(true);
    try {
      const result = await placeService.getAll(selectedPlaceTypeId ? { placeTypeId: selectedPlaceTypeId } : undefined);
      if (result.isSucceed && result.value) {
        setPlaces(result.value);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.error('Failed to fetch places:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPlaceTypeId, isRefreshing]);

  // Fetch places on mount and when filter changes
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Handle placeId from URL
  useEffect(() => {
    if (placeIdFromUrl && !hasProcessedUrlParam) {
      const handleUrlParam = async () => {
        // If places are still loading, wait or fetch specifically
        // If not in currently loaded places (might be filtered out), fetch by ID
        const existing = places.find(p => p.id === placeIdFromUrl);
        if (existing) {
          setSelectedPlace(existing);
          setSelectedPlaceTypeId(null); // Clear filter to show the place
          setView('map');
          setHasProcessedUrlParam(true);
        } else if (!loading) {
          // If not loading and not found, fetch specifically
          const result = await placeService.getById(placeIdFromUrl);
          if (result.isSucceed && result.value) {
            setPlaces(prev => {
              if (prev.some(p => p.id === result.value!.id)) return prev;
              return [...prev, result.value!];
            });
            setSelectedPlace(result.value);
            setSelectedPlaceTypeId(null);
            setView('map');
          }
          setHasProcessedUrlParam(true);
        }
      };
      handleUrlParam();
    }
  }, [placeIdFromUrl, places, loading, hasProcessedUrlParam]);

  const handleSearchPlaceSelect = (place: PlaceDto) => {
    setSelectedPlace(place);
    setSelectedPlaceTypeId(null); // Clear filter to show search result
    setView('map');
  };

  const handlePlaceClick = (place: PlaceDto) => {
    setSelectedPlace(place);
    setView('map');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPlaces();
  };

  return (
    <div className="h-full w-full bg-zinc-50 font-sans dark:bg-black flex flex-col">
      {/* Search Bar + Toggle - Always visible */}
      <div className="p-2 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 flex items-center gap-2">
        <SearchBar onPlaceSelect={handleSearchPlaceSelect} />
        <button
          onClick={() => setView(view === 'map' ? 'list' : 'map')}
          className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex-shrink-0"
          title={view === 'map' ? 'Show list view' : 'Show map view'}
        >
          {view === 'map' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="px-2 py-2 flex flex-wrap gap-2 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={() => setSelectedPlaceTypeId(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedPlaceTypeId === null
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {placeTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedPlaceTypeId(type.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedPlaceTypeId === type.id
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <div className={view === 'map' ? 'w-full h-full' : 'hidden'}>
          <MapView 
            places={places}
            selectedPlace={selectedPlace} 
            onPlaceSelect={setSelectedPlace} 
          />
        </div>
        {view === 'list' && (
          <PlaceList 
            places={places} 
            onPlaceClick={handlePlaceClick}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-zinc-50 dark:bg-black animate-pulse" />}>
      <MapContent />
    </Suspense>
  );
}

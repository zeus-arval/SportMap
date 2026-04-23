'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PlaceDetailSheet from './PlaceDetailSheet';
import { RecenterButton } from './navigation/RecenterButton';
import type { PlaceDto } from '@/types/place';

interface MapViewProps {
  places: PlaceDto[];
  selectedPlace?: PlaceDto | null;
  onPlaceSelect?: (place: PlaceDto | null) => void;
}

const TALLINN_CENTER: [number, number] = [24.7421, 59.4379];

export default function MapView({ places, selectedPlace: selectedPlaceProp, onPlaceSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDto | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Sync selectedPlace from parent and fly to location
  useEffect(() => {
    if (selectedPlaceProp) {
      setSelectedPlace(selectedPlaceProp);
      
      // Fly to the selected place
      const map = mapInstanceRef.current;
      if (map) {
        map.flyTo({
          center: [selectedPlaceProp.longitude, selectedPlaceProp.latitude],
          zoom: 16,
          essential: true
        });
      }
    }
  }, [selectedPlaceProp]);

  // When user clicks marker, notify parent
  const handlePlaceClick = (place: PlaceDto) => {
    setSelectedPlace(place);
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const handlePlaceClose = () => {
    const map = mapInstanceRef.current;    
    map?.zoomOut();    
    setSelectedPlace(null);
    if (onPlaceSelect) {
      onPlaceSelect(null);
    }
  };

  const handleReport = () => {
    alert('Report functionality would be implemented here');
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Use stored user location or get fresh one
    if (userLocation) {
      map.flyTo({
        center: userLocation,
        zoom: 14,
        essential: true
      });
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(newCenter);
          map.flyTo({
            center: newCenter,
            zoom: 14,
            essential: true
          });
        },
        (err) => {
          console.warn('Unable to get current location for recentering: ', err);
          // Fallback to Tallinn center if geolocation denied
          map.flyTo({
            center: TALLINN_CENTER,
            zoom: 14,
            essential: true
          });
        }
      );
    } else {
      // Fallback to Tallinn center if geolocation not supported
      map.flyTo({
        center: TALLINN_CENTER,
        zoom: 14,
        essential: true
      });
    }
  };

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(location);
        },
        (err) => {
          console.warn('Unable to get user location:', err);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Set the access token if we are on the client
    if (typeof window !== 'undefined') {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        console.error('Mapbox access token is not defined in environment variables');
        return;
      }
      mapboxgl.accessToken = token;
    }

    let map: mapboxgl.Map | null = null;

    const initMap = async () => {
      let center: [number, number] = [24.7421, 59.4379]; // Default to Tallinn

      // Try to get the current position
      if ('geolocation' in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              center = [pos.coords.longitude, pos.coords.latitude] as [number, number];
              setUserLocation(center);
              resolve();
            },
            (err) => {
              console.warn('Unable to get current location: ', err);
              resolve(); // Still resolve so we use the default
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        });
      }

      if (!mapRef.current) return; // Double-check ref still exists

      try {
        map = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/dark-v10',
          center: center,
          zoom: 14
        });

        // Add navigation control
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Store map instance
        mapInstanceRef.current = map;

        // If there's an initial selected place, fly to it
        if (selectedPlaceProp) {
          map.flyTo({
            center: [selectedPlaceProp.longitude, selectedPlaceProp.latitude],
            zoom: 16,
            essential: true
          });
        }
      } catch (error) {
        console.error('Error initializing Mapbox map:', error);
      }
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add user location marker when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Remove existing user location marker
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
    }

    // Create user location marker element
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.backgroundColor = '#3b82f6';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid #fff';
    el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 10px rgba(0,0,0,0.3)';

    // Add to map
    const marker = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .addTo(map);
    
    userLocationMarkerRef.current = marker;

    return () => {
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
    };
  }, [userLocation]);

  // Add markers when places change
  useEffect(() => {
    const addMarkers = () => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (places.length === 0) return;

      places.forEach((place) => {
        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundColor = place.placeType?.name === 'Park' ? '#22c55e' : 
                                  place.placeType?.name === 'Gym' ? '#3b82f6' : 
                                  place.placeType?.name === 'Stadium' ? '#f97316' : '#a855f7';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #fff';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

        // Add click handler
        el.addEventListener('click', () => {
          handlePlaceClick(place);
        });

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([place.longitude, place.latitude])
          .addTo(map);
        
        markersRef.current.push(marker);
      });
    };

    // Try to add markers immediately, or retry after short delay
    const tryAddMarkers = () => {
      const map = mapInstanceRef.current;
      if (!map) {
        setTimeout(tryAddMarkers, 100);
        return;
      }
      
      if (!map.isStyleLoaded()) {
        map.once('load', addMarkers);
        return;
      }
      
      addMarkers();
    };

    tryAddMarkers();
  }, [places]);

  return (
    <div className="w-full h-full relative">
      <style>{`
        .mapboxgl-ctrl-top-right {
          top: 60px !important;
          right: 8px !important;
        }
        .mapboxgl-ctrl-group {
          background-color: white !important;
          border-radius: 4px !important;
          box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
        }
        .mapboxgl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
      `}</style>
      
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 z-30">
        <RecenterButton onClick={handleRecenter} />
      </div>
      <PlaceDetailSheet
        place={selectedPlace}
        onClose={handlePlaceClose}
        onReport={handleReport} />
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function MapPreview({
  latitude,
  longitude,
  className = "w-full h-32 rounded-xl",
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token || !mapRef.current) return;

      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [longitude, latitude],
        zoom: 14,
        attributionControl: false,
        interactive: false,
      });

      mapInstanceRef.current = map;

      map.on("load", () => {
        // Add marker
        const el = document.createElement("div");
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.backgroundColor = "#22c55e";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 0 10px rgba(34,197,94,0.6)";

        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
    </div>
  );
}
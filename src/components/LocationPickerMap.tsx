"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type LocationPickerMapProps = {
  lat: number | null;
  lng: number | null;
  onPick: (coords: { lat: number; lng: number }) => void;
};

const markerIcon = L.divIcon({
  className: "custom-location-picker-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #F4A261;
      border-radius: 9999px;
      border: 3px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.18);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({
  onPick,
}: {
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

function FlyToSelected({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (lat == null || lng == null) return;

    map.flyTo([lat, lng], map.getZoom(), {
      duration: 0.5,
    });
  }, [lat, lng, map]);

  return null;
}

export default function LocationPickerMap({
  lat,
  lng,
  onPick,
}: LocationPickerMapProps) {
  const defaultCenter: [number, number] =
    lat != null && lng != null ? [lat, lng] : [25.033, 121.5654];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-brand-line">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        scrollWheelZoom
        className="h-56 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPick={onPick} />
        <FlyToSelected lat={lat} lng={lng} />

        {lat != null && lng != null && (
          <Marker position={[lat, lng]} icon={markerIcon} />
        )}
      </MapContainer>
    </div>
  );
}
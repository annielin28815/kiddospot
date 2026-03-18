"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ⭐️ 修正 marker icon 問題
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function Map({ places }: any) {
  return (
    <MapContainer center={[25.033, 121.5654]} zoom={13} className="h-full w-full">
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

      {places.length > 0 && places.map((place: any) => {
        const lat = Number(place.lat);
        const lng = Number(place.lng);
      
        if (isNaN(lat) || isNaN(lng)) return null;
      
          return (
            <Marker key={place.id} position={[lat, lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
"use client";

import { useRef, useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

const createMarkerIcon = (isSelected: boolean, isHovered: boolean) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div class="
      marker-dot
      ${isSelected ? "selected" : ""}
      ${isHovered ? "hovered" : ""}
    "></div>`,
  });

function FlyToLocation({ place, onDone }: any) {
  const map = useMap();

  useEffect(() => {
    if (!place) return;

    map.flyTo([place.lat, place.lng], 15, { duration: 0.8 });

    map.once("moveend", () => {
      onDone?.();
    });
  }, [place, map]);

  return null;
}

type Favorite = {
  userId: string;
};

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  favorites?: Favorite[];
};

export default function Map({
  places,
  setPlaces,
  userId,
  selectedPlaceId,
  hoveredPlaceId,
  onSelect,
}: {
  places: Place[];
  setPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  userId?: string;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const [favPlaces, setFavPlaces] = useState<Place[]>([]);

  const selectedPlace = Array.isArray(places)
    ? places.find((p: any) => p.id === selectedPlaceId)
    : null;

    const toggleFavorite = async (placeId: string) => {
      if (!userId) return;
    
      setPlaces((prev) =>
        prev.map((p) => {
          if (p.id !== placeId) return p;
    
          const isFav = p.favorites?.some((f) => f.userId === userId);
    
          return {
            ...p,
            favorites: isFav
              ? p.favorites?.filter((f) => f.userId !== userId)
              : [...(p.favorites || []), { userId }],
          };
        })
      );
    
      try {
        await fetch("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ placeId }),
        });
      } catch (err) {
        console.error("favorite error", err);
      }
    };

  return (
    <MapContainer
      center={[25.033, 121.5654]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      closePopupOnClick={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {selectedPlace && (
        <FlyToLocation
          place={selectedPlace}
          onDone={() => {
            const marker = markerRefs.current[selectedPlaceId!];
            marker?.openPopup();
          }}
        />
      )}

      {places.map((place) => {
        const isFavorited =
        !!userId &&
        (place.favorites ?? []).some((f) => f.userId === userId);

        return (
          <Marker
            key={place.id}
            position={[Number(place.lat), Number(place.lng)]}
            icon={createMarkerIcon(
              selectedPlaceId === place.id,
              hoveredPlaceId === place.id
            )}
            ref={(ref) => {
              if (ref) markerRefs.current[place.id] = ref;
            }}
            eventHandlers={{
              click: () => onSelect(place.id),
            }}
          >
            <Popup closeButton={false}>
              <div className="w-[200px] space-y-1">
                <h3 className="font-semibold text-sm">
                  {place.name}
                </h3>

                <p className="text-xs text-gray-500">
                  ⭐ {place.avgRating ?? "尚無評分"}
                </p>

                <p className="text-xs line-clamp-2 text-gray-600">
                  {place.description || "暫無描述"}
                </p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                  target="_blank"
                  className="text-xs text-blue-500 hover:underline"
                >
                  在 Google Maps 查看 →
                </a>

                {/* ❤️ 收藏按鈕 */}
                <button
                  onClick={() => toggleFavorite(place.id)}
                  className="text-sm mt-1"
                >
                  {isFavorited ? "❤️ 已收藏" : "🤍 收藏"}
                </button>

                <p>by {place.createdBy?.name}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
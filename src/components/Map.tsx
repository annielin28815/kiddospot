"use client";

import { useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { Place } from "@/src/types/place";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

const createMarkerIcon = (isSelected: boolean, isHovered: boolean) => {
  let bg = "#7FA7C9";

  if (isSelected) {
    bg = "#EF4444";
  } else if (isHovered) {
    bg = "#F4A261";
  }

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 14px;
        height: 14px;
        background: ${bg};
        border-radius: 9999px;
        border: 2px solid white;
        box-shadow: 0 0 6px rgba(0,0,0,0.2);
        transform: scale(${isSelected ? 1.5 : isHovered ? 1.3 : 1});
        transition: all 0.2s ease;
      "></div>
    `,
  });
};

function FlyToLocation({ place }: { place: Place | null }) {
  const map = useMap();

  useEffect(() => {
    if (!place?.lat || !place?.lng) return;

    map.flyTo([Number(place.lat), Number(place.lng)], 15, {
      duration: 0.8,
    });
  }, [place?.id, place?.lat, place?.lng, map]);

  return null;
}

type MapProps = {
  userId: string;
  places: Place[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelect: (id: string | null) => void;
  onToggleFavorite: (placeId: string) => void;
};

export default function Map({
  places,
  userId,
  selectedPlaceId,
  hoveredPlaceId,
  onSelect,
  onToggleFavorite,
}: MapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const selectedPlace =
    places.find((place) => place.id === selectedPlaceId) ?? null;

  useEffect(() => {
    if (!selectedPlaceId) return;

    const timer = setTimeout(() => {
      const marker = markerRefs.current[selectedPlaceId];
      if (marker) {
        marker.openPopup();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPlaceId]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={
          selectedPlace
            ? [Number(selectedPlace.lat), Number(selectedPlace.lng)]
            : [25.033, 121.5654]
        }
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
      >
        <ResizeFix />
        <FlyToLocation place={selectedPlace} />

        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place) => {
          const isFavorited =
            !!userId &&
            (place.favorites?.some((favorite) => favorite.userId === userId) ??
              false);

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
                <div className="w-[220px] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#4a2e00]">
                      {place.name}
                    </h3>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(place.id);
                      }}
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                        isFavorited
                          ? "border-[#F4A261]/30 bg-[#F4A261]/15 text-[#F4A261]"
                          : "border-[#EADBC8] bg-white text-[#8F7B70] hover:bg-[#FFF7F2]"
                      }`}
                      aria-label={
                        isFavorited ? "Remove favorite" : "Add favorite"
                      }
                    >
                      <Heart
                        size={14}
                        className={isFavorited ? "fill-current" : ""}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-[#8a6a4a]">📍 {place.address}</p>

                  {(place.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.tagId}
                          className="rounded-md bg-[#fff4e5] px-2 py-0.5 text-[10px] text-[#8a4b00]"
                        >
                          {tag.tag.name}
                        </span>
                      ))}
                      {place.tags.length > 3 && (
                        <span className="px-1 text-[10px] text-[#8C7B71]">
                          +{place.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {(place.facilities ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {place.facilities.slice(0, 3).map((facility) => (
                        <span
                          key={facility.facilityId}
                          className="rounded-md bg-[#f7e6d2] px-2 py-0.5 text-[10px] text-[#6b3a00]"
                        >
                          {facility.facility.name}
                        </span>
                      ))}
                      {place.facilities.length > 3 && (
                        <span className="px-1 text-[10px] text-[#8C7B71]">
                          +{place.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="border-t pt-1 text-[10px] text-[#b8a08c]">
                    {place.createdBy?.name?.trim()
                      ? `by ${place.createdBy.name.trim()}`
                      : "官方推薦"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
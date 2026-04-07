"use client";

import { useRef, useEffect } from "react";
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
  let bg = "#7FA7C9"; // 預設藍色

  if (isSelected) {
    bg = "#EF4444"; // 紅色
  } else if (isHovered) {
    bg = "#F4A261"; // hover 橘色（可選）
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

function FlyToLocation({ place, onDone }: any) {
  const map = useMap();

  useEffect(() => {
    if (!place?.lat || !place?.lng) return;

    map.flyTo([Number(place.lat), Number(place.lng)], 15, { duration: 0.8 });

    const handleMoveEnd = () => {
      onDone?.();
    };

    map.once("moveend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [place?.id, place?.lat, place?.lng, map, onDone]);

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

  const selectedPlace = Array.isArray(places)
    ? places.find((p: any) => p.id === selectedPlaceId)
    : null;

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

        {places.map((place) => (
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
                <h3 className="font-semibold text-sm text-[#4a2e00]">
                  {place.name}
                </h3>

                <p className="text-xs text-[#8a6a4a]">
                  📍 {place.address}
                </p>

                {place.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {place.tags.map((tag) => (
                      <span
                        key={tag.tagId}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-[#fff4e5] text-[#8a4b00]"
                      >
                        {tag.tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {place.facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {place.facilities.map((f) => (
                      <span
                        key={f.facilityId}
                        className="px-2 py-0.5 text-[10px] rounded-md bg-[#f7e6d2] text-[#6b3a00]"
                      >
                        {f.facility.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-[#b8a08c] pt-1 border-t">
                  {place.createdBy?.name?.trim()
                    ? "by " + place.createdBy.name.trim()
                    : "官方推薦"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
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

type DisplayTag =
  | {
      id: string;
      name: string;
    }
  | {
      tagId: string;
      tag: {
        id: string;
        name: string;
      };
    };

type DisplayFacility =
  | {
      id: string;
      name: string;
    }
  | {
      facilityId: string;
      facility: {
        id: string;
        name: string;
      };
    };

type DisplayPlace = Place & {
  sourceType?: "GOV_FAMILY_TOILET" | "GOV_NURSING_ROOM" | "GOV_PARENTING_CENTER";
  sourceLabel?: string;
  city?: string | null;
  district?: string | null;
  phone?: string | null;
  openTime?: string | null;
  note?: string | null;
  officialUrl?: string | null;
  tags?: DisplayTag[];
  facilities?: DisplayFacility[];
};

function getTagKey(tag: DisplayTag) {
  return "tagId" in tag ? tag.tagId : tag.id;
}

function getTagName(tag: DisplayTag) {
  return "tag" in tag ? tag.tag.name : tag.name;
}

function getFacilityKey(facility: DisplayFacility) {
  return "facilityId" in facility ? facility.facilityId : facility.id;
}

function getFacilityName(facility: DisplayFacility) {
  return "facility" in facility ? facility.facility.name : facility.name;
}

function isExternalPlace(place: DisplayPlace) {
  return !!place.sourceType;
}

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

const createMarkerIcon = (
  place: DisplayPlace,
  isSelected: boolean,
  isHovered: boolean
) => {
  let bg = isExternalPlace(place) ? "#8CBF9F" : "#7FA7C9";

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

function FlyToLocation({ place }: { place: DisplayPlace | null }) {
  const map = useMap();

  useEffect(() => {
    if (place?.lat == null || place?.lng == null) return;

    map.flyTo([Number(place.lat), Number(place.lng)], 15, {
      duration: 0.8,
    });
  }, [place?.id, place?.lat, place?.lng, map]);

  return null;
}

type MapProps = {
  userId: string;
  places: DisplayPlace[];
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
    <div className="relative z-0 h-full w-full">
      <MapContainer
        center={
          selectedPlace?.lat != null && selectedPlace?.lng != null
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

        {places
          .filter((place) => place.lat != null && place.lng != null)
          .map((place) => {
            const isFavorited =
              !!userId &&
              (place.favorites?.some((favorite) => favorite.userId === userId) ??
                false);

            const isExternal = isExternalPlace(place);

            return (
              <Marker
                key={place.id}
                position={[Number(place.lat), Number(place.lng)]}
                icon={createMarkerIcon(
                  place,
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
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#4a2e00]">
                          {place.name}
                        </h3>

                        {place.sourceLabel && (
                          <div className="mt-1">
                            <span className="inline-flex items-center rounded-full bg-[#EEF8F1] px-2 py-0.5 text-[10px] font-medium text-[#456A54]">
                              {place.sourceLabel}
                            </span>
                          </div>
                        )}
                      </div>

                      {!isExternal && (
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
                      )}
                    </div>

                    <p className="text-xs text-[#8a6a4a]">📍 {place.address}</p>

                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {place.tags.slice(0, 3).map((tag) => (
                          <span
                            key={getTagKey(tag)}
                            className="rounded-md bg-[#fff4e5] px-2 py-0.5 text-[10px] text-[#8a4b00]"
                          >
                            {getTagName(tag)}
                          </span>
                        ))}
                        {place.tags.length > 3 && (
                          <span className="px-1 text-[10px] text-[#8C7B71]">
                            +{place.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {place.facilities && place.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {place.facilities.slice(0, 3).map((facility) => (
                          <span
                            key={getFacilityKey(facility)}
                            className="rounded-md bg-[#f7e6d2] px-2 py-0.5 text-[10px] text-[#6b3a00]"
                          >
                            {getFacilityName(facility)}
                          </span>
                        ))}
                        {place.facilities.length > 3 && (
                          <span className="px-1 text-[10px] text-[#8C7B71]">
                            +{place.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {place.openTime && (
                      <p className="text-[10px] text-[#8C7B71]">
                        🕒 {place.openTime}
                      </p>
                    )}

                    {place.note && (
                      <p className="text-[10px] text-[#8C7B71]">
                        {place.note}
                      </p>
                    )}

                    <p className="border-t pt-1 text-[10px] text-[#b8a08c]">
                      {isExternal
                        ? "資料來源：政府開放資料"
                        : place.createdBy?.name?.trim()
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
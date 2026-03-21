"use client";
import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createMarkerIcon = (
  isSelected: boolean,
  isHovered: boolean
) =>
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

    map.flyTo([place.lat, place.lng], 15, {
      duration: 0.8,
    });

    map.once("moveend", () => {
      onDone?.();
    });
  }, [place, map]);

  return null;
}

export default function Map({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  onSelect
}: {
  places: any[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelect: (id: string) => void;
}) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const selectedPlace = places.find(
    (p: any) => p.id === selectedPlaceId
  );

  useEffect(() => {
    if (!selectedPlaceId) return;
    
    const marker = markerRefs.current[selectedPlaceId];

    setTimeout(() => {
      if (marker) {
        marker.openPopup();
      }
    }, 20)
  }, [selectedPlaceId]);

  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (!el) return;
  
      if (id === hoveredPlaceId) {
        el.classList.add("hovered");
      } else {
        el.classList.remove("hovered");
      }
    });
  }, [hoveredPlaceId]);

  useEffect(() => {
    Object.values(markerRefs.current).forEach((marker:any) => {
      marker.on("popupclose", () => {
        onSelect(null as any); // 👈 清掉選取
      });
    });
  }, []);

  return (
    <MapContainer
      center={[25.0330, 121.5654]} // 預設台北
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      closePopupOnClick={true}
      whenCreated={(map) => {
        map.on("click", (e: any) => {
          console.log(e.latlng);
        });
      }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 讓地圖跟著動 */}
      {selectedPlace && (
        <FlyToLocation
          place={selectedPlace}
          onDone={() => {
            const marker = markerRefs.current[selectedPlaceId!];
            marker?.openPopup();
          }}
        />
      )}

      {/* 所有 marker */}
      {places.length > 0 && places.map((place) => {
        const rating = place.rating ?? "尚無評分";
        return (
          <Marker
            key={place.id}
            position={[Number(place.lat), Number(place.lng)]}
            icon={createMarkerIcon(
              selectedPlaceId === place.id,
              hoveredPlaceId === place.id
            )}
            eventHandlers={{
              click: () => onSelect(place.id),
            }}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[place.id] = ref;
              }
            }}
          >
            <Popup closeButton={false}>
              <div className="w-[200px] space-y-1">
                <h3 className="font-semibold text-sm leading-tight">
                  {place.name}
                </h3>

                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <span>⭐</span>
                  <span>{place.rating ?? "尚無評分"}</span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-snug">
                  {place.description || "暫無描述"}
                </p>

                <div className="pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                    target="_blank"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    在 Google Maps 查看 →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>

        )
      })}
    </MapContainer>
  );
}
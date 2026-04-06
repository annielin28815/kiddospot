import { useRef } from "react";

export default function PlaceList({
  places,
  selectedPlaceId,
  onSelect,
  onHover,
  hoveredPlaceId
}: {
  places: any[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {places.length > 0 && places.map((place) => (
        <div
          key={place.id}
          ref={(el) => (itemRefs.current[place.id] = el)}
          onClick={() => onSelect(place.id)}
          onMouseEnter={() => onHover(place.id)}
          onMouseLeave={() => onHover(null)}
          className={`border rounded-lg p-4 shadow cursor-pointer transition
            ${
              selectedPlaceId === place.id
                ? "bg-blue-100 border-blue-500"
                : hoveredPlaceId === place.id
                ? "bg-gray-100"
                : ""
            }`}
        >
          <div className="space-y-1">
            <h3 className="font-medium text-[#4a2e00]">
              {place.name}
            </h3>

            <p className="text-xs text-[#8a6a4a]">
              📍 {place.address}
            </p>

            {/* 顯示前2個 tags */}
            {place.tags?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {place.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.tagId}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#fff4e5] text-[#8a4b00]"
                  >
                    {tag.tag.name}
                  </span>
                ))}
                {place.tags.length > 2 && (
                  <span className="text-[10px] text-[#b8a08c]">
                    +{place.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
          {/* <h2 className="font-semibold">{place.name}</h2>
          <p className="text-sm text-gray-500">{place.address}</p> */}
        </div>
      ))}
    </div>
  );
}
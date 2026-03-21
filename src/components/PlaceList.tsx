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
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {places.length > 0 && places.map((place) => (
        <div
          key={place.id}
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
          <h2 className="font-semibold">{place.name}</h2>
          <p className="text-sm text-gray-500">{place.address}</p>
        </div>
      ))}
    </div>
  );
}
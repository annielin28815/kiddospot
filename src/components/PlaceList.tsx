export default function PlaceList({ places }: any) {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {places.map((place: any) => (
        <div key={place.id} className="border rounded-lg p-4 shadow">
          <h2 className="font-semibold">{place.name}</h2>
          <p className="text-sm text-gray-500">
            {place.address}
          </p>
        </div>
      ))}
    </div>
  );
}
export async function geocodeAddress(address: string) {
  // 你可以先用政府/合法可用的 geocoding 服務
  // 也可以先保守：只處理你真的要匯入顯示的資料
  // 這裡先只示意
  const encoded = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Kiddospot/1.0",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const first = data?.[0];

  if (!first) return null;

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
  };
}
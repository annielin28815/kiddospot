type GovParentingCenterRaw = {
  機構名稱?: string;
  行政區代碼?: string;
  地址?: string;
  電話?: string;
  分機?: string;
};

type GovNursingRoomRaw = {
  編號?: string;
  場所名稱?: string;
  縣市?: string;
  "鄉-鎮-市-區"?: string;
  電話?: string;
  分機?: string;
  開放時間?: string;
  開放時段?: string;
  注意事項?: string;
  設置依據?: string;
  // 其他欄位先保留在 raw
};

type GovFamilyToiletRaw = {
  name?: string;
  address?: string;
  wgs84ax?: string | number;
  wgs84ay?: string | number;
  latitude?: string | number;
  longitude?: string | number;
};

export function normalizeParentingCenter(
  row: GovParentingCenterRaw,
  extra?: { lat?: number | null; lng?: number | null }
) {
  return {
    source: "gov-parenting-center",
    sourceId: row.機構名稱 ?? crypto.randomUUID(),
    name: row.機構名稱 ?? "未命名親子館",
    address: row.地址 ?? null,
    lat: extra?.lat ?? null,
    lng: extra?.lng ?? null,
    phone: row.電話 ?? null,
    city: "臺北市",
    district: null,
    openTime: null,
    note: row.分機 ? `分機：${row.分機}` : null,
    raw: row,
    tags: ["親子館"],
    facilities: [],
  };
}

export function normalizeNursingRoom(row: GovNursingRoomRaw) {
  const address = [
    row.縣市,
    row["鄉-鎮-市-區"],
  ].filter(Boolean).join("");

  return {
    source: "gov-nursing-room",
    sourceId: row.編號 ?? row.場所名稱 ?? crypto.randomUUID(),
    name: row.場所名稱 ?? "未命名哺乳室",
    address: address || null,
    lat: null,
    lng: null,
    phone: row.電話 ?? null,
    city: row.縣市 ?? null,
    district: row["鄉-鎮-市-區"] ?? null,
    openTime: [row.開放時間, row.開放時段].filter(Boolean).join(" / ") || null,
    note: row.注意事項 ?? row.設置依據 ?? null,
    raw: row,
    tags: ["哺乳室"],
    facilities: ["哺乳空間"],
  };
}

export function normalizeFamilyToilet(row: GovFamilyToiletRaw) {
  const lat = Number(row.wgs84ax ?? row.latitude);
  const lng = Number(row.wgs84ay ?? row.longitude);

  return {
    source: "gov-family-toilet",
    sourceId: `${row.name}-${row.address}`,
    name: row.name ?? "未命名親子廁所",
    address: row.address ?? null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    phone: null,
    city: null,
    district: null,
    openTime: null,
    note: null,
    raw: row,
    tags: ["親子廁所"],
    facilities: ["尿布台", "親子友善"],
  };
}
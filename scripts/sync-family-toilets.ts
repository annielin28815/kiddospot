import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import iconv from "iconv-lite";
import prisma from "../src/lib/prisma";
import { ExternalSourceType } from "@prisma/client";

type GovFamilyToiletCsvRow = {
  行政區?: string;
  公廁編號?: string;
  公廁類別?: string;
  公廁名稱?: string;
  公廁位置?: string;
  公廁等級?: string;
  公廁地址?: string;
  經度?: string;
  緯度?: string;
  管理單位?: string;
  尿布臺設置數量?: string;
  兒童座椅設置數量?: string;
  親子友善評鑑獲獎?: string;
};

function toCleanString(value: unknown) {
  if (value == null) return "";
  return String(value).replace(/^\uFEFF/, "").trim();
}

function toNullableNumber(value: unknown) {
  const cleaned = toCleanString(value).replace(/"/g, "");
  if (!cleaned) return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function normalizeRow(row: GovFamilyToiletCsvRow) {
  const name = toCleanString(row.公廁名稱) || "未命名親子廁所";
  const address = toCleanString(row.公廁地址);
  const lat = toNullableNumber(row.緯度);
  const lng = toNullableNumber(row.經度);
  const sourceId = toCleanString(row.公廁編號) || `${name}-${address}`;

  return {
    sourceId,
    name,
    address,
    lat,
    lng,
    note: toCleanString(row.公廁位置) || null,
    rawData: row,
  };
}

async function readCsvFile() {
  const filePath = path.join(
    process.cwd(),
    "scripts",
    "data",
    "family-toilets.csv"
  );

  const buffer = await fs.readFile(filePath);
  const csvText = iconv.decode(buffer, "big5");

  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  }) as GovFamilyToiletCsvRow[];

  console.log("csv rows:", rows.length);

  if (rows.length > 0) {
    console.log("first row raw:", rows[0]);
    console.log("first row keys:", Object.keys(rows[0]));
  }

  return rows;
}

async function ensureFacility(placeId: string, row: GovFamilyToiletCsvRow) {
  const diaperCount = toNullableNumber(row.尿布臺設置數量);
  const childSeatCount = toNullableNumber(row.兒童座椅設置數量);

  if (diaperCount != null && diaperCount > 0) {
    const diaperFacility = await prisma.externalFacility.upsert({
      where: { name: "尿布台" },
      update: {},
      create: { name: "尿布台" },
    });

    await prisma.externalPlaceFacility.upsert({
      where: {
        externalPlaceId_facilityId: {
          externalPlaceId: placeId,
          facilityId: diaperFacility.id,
        },
      },
      update: {},
      create: {
        externalPlaceId: placeId,
        facilityId: diaperFacility.id,
      },
    });
  }

  if (childSeatCount != null && childSeatCount > 0) {
    const familyToiletFacility = await prisma.externalFacility.upsert({
      where: { name: "親子廁所" },
      update: {},
      create: { name: "親子廁所" },
    });

    await prisma.externalPlaceFacility.upsert({
      where: {
        externalPlaceId_facilityId: {
          externalPlaceId: placeId,
          facilityId: familyToiletFacility.id,
        },
      },
      update: {},
      create: {
        externalPlaceId: placeId,
        facilityId: familyToiletFacility.id,
      },
    });
  }
}

async function upsertPlace(row: GovFamilyToiletCsvRow) {
  const item = normalizeRow(row);

  if (item.lat == null || item.lng == null) {
    console.log("skip no lat/lng:", {
      name: item.name,
      sourceId: item.sourceId,
      rawLat: row.緯度,
      rawLng: row.經度,
      parsedLat: item.lat,
      parsedLng: item.lng,
    });
    return;
  }

  const place = await prisma.externalPlace.upsert({
    where: {
      sourceType_sourceId: {
        sourceType: ExternalSourceType.GOV_FAMILY_TOILET,
        sourceId: item.sourceId,
      },
    },
    update: {
      name: item.name,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      note: item.note,
      rawData: item.rawData,
      lastSyncedAt: new Date(),
      isActive: true,
    },
    create: {
      sourceType: ExternalSourceType.GOV_FAMILY_TOILET,
      sourceId: item.sourceId,
      name: item.name,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      note: item.note,
      rawData: item.rawData,
      isActive: true,
    },
  });

  await ensureFacility(place.id, row);

  console.log("facility counts:", {
    name: item.name,
    diaperCount: toNullableNumber(row.尿布臺設置數量),
    childSeatCount: toNullableNumber(row.兒童座椅設置數量),
  });
}

async function main() {
  console.log("start syncing family toilets from local csv...");

  await prisma.externalPlaceFacility.deleteMany({
    where: {
      externalPlace: {
        sourceType: "GOV_FAMILY_TOILET",
      },
    },
  });

  await prisma.externalPlaceTag.deleteMany({
    where: {
      externalPlace: {
        sourceType: "GOV_FAMILY_TOILET",
      },
    },
  });

  await prisma.externalPlace.deleteMany({
    where: {
      sourceType: "GOV_FAMILY_TOILET",
    },
  });

  const rows = await readCsvFile();

  let count = 0;

  for (const row of rows) {
    await upsertPlace(row);
    count++;

    if (count % 50 === 0) {
      console.log(`progress: ${count}/${rows.length}`);
    }
  }

  console.log("sync done");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
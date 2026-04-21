-- CreateEnum
CREATE TYPE "ExternalSourceType" AS ENUM ('GOV_FAMILY_TOILET', 'GOV_NURSING_ROOM', 'GOV_PARENTING_CENTER');

-- CreateTable
CREATE TABLE "ExternalPlace" (
    "id" TEXT NOT NULL,
    "sourceType" "ExternalSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "city" TEXT,
    "district" TEXT,
    "phone" TEXT,
    "openTime" TEXT,
    "note" TEXT,
    "officialUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rawData" JSONB,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalFacility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalPlaceTag" (
    "externalPlaceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ExternalPlaceTag_pkey" PRIMARY KEY ("externalPlaceId","tagId")
);

-- CreateTable
CREATE TABLE "ExternalPlaceFacility" (
    "externalPlaceId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "ExternalPlaceFacility_pkey" PRIMARY KEY ("externalPlaceId","facilityId")
);

-- CreateIndex
CREATE INDEX "ExternalPlace_sourceType_idx" ON "ExternalPlace"("sourceType");

-- CreateIndex
CREATE INDEX "ExternalPlace_isActive_idx" ON "ExternalPlace"("isActive");

-- CreateIndex
CREATE INDEX "ExternalPlace_city_district_idx" ON "ExternalPlace"("city", "district");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalPlace_sourceType_sourceId_key" ON "ExternalPlace"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalTag_name_key" ON "ExternalTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalFacility_name_key" ON "ExternalFacility"("name");

-- CreateIndex
CREATE INDEX "ExternalPlaceTag_tagId_idx" ON "ExternalPlaceTag"("tagId");

-- CreateIndex
CREATE INDEX "ExternalPlaceFacility_facilityId_idx" ON "ExternalPlaceFacility"("facilityId");

-- AddForeignKey
ALTER TABLE "ExternalPlaceTag" ADD CONSTRAINT "ExternalPlaceTag_externalPlaceId_fkey" FOREIGN KEY ("externalPlaceId") REFERENCES "ExternalPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPlaceTag" ADD CONSTRAINT "ExternalPlaceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ExternalTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPlaceFacility" ADD CONSTRAINT "ExternalPlaceFacility_externalPlaceId_fkey" FOREIGN KEY ("externalPlaceId") REFERENCES "ExternalPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPlaceFacility" ADD CONSTRAINT "ExternalPlaceFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ExternalFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `Facility` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `diaperStation` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `nursingRoom` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `parking` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `playArea` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `strollerFriendly` on the `Facility` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Facility` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Facility` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_placeId_fkey";

-- AlterTable
ALTER TABLE "Facility" DROP CONSTRAINT "Facility_pkey",
DROP COLUMN "diaperStation",
DROP COLUMN "nursingRoom",
DROP COLUMN "parking",
DROP COLUMN "placeId",
DROP COLUMN "playArea",
DROP COLUMN "strollerFriendly",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "Facility_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "PlaceFacility" (
    "placeId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "PlaceFacility_pkey" PRIMARY KEY ("placeId","facilityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- AddForeignKey
ALTER TABLE "PlaceFacility" ADD CONSTRAINT "PlaceFacility_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceFacility" ADD CONSTRAINT "PlaceFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

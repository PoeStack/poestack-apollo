/*
  Warnings:

  - You are about to drop the column `totalValidListings` on the `ItemGroupStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItemGroupStats" DROP COLUMN "totalValidListings",
ADD COLUMN     "lastUpdateWithListingsTimestamp" TIMESTAMP(3);

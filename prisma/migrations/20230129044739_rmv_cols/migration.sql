/*
  Warnings:

  - You are about to drop the column `valueHistoryLastUpdateWithListingsTimestamp` on the `ItemGroup` table. All the data in the column will be lost.
  - You are about to drop the column `valueHistoryUpdatedAtTimestamp` on the `ItemGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItemGroup" DROP COLUMN "valueHistoryLastUpdateWithListingsTimestamp",
DROP COLUMN "valueHistoryUpdatedAtTimestamp";

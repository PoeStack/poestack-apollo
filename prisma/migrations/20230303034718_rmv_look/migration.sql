/*
  Warnings:

  - You are about to drop the column `lookbackWindowUsedHours` on the `ItemGroupPValueHourlyTimeseriesEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" DROP COLUMN "lookbackWindowUsedHours";

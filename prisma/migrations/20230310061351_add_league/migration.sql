/*
  Warnings:

  - The primary key for the `ItemGroupPValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ItemGroupPValueDailyTimeseriesEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ItemGroupPValueHourlyTimeseriesEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ItemGroupPValue" DROP CONSTRAINT "ItemGroupPValue_hashString_fkey";

-- DropForeignKey
ALTER TABLE "ItemGroupPValueDailyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_hashString_fkey";

-- DropForeignKey
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_hashString_fkey";

-- AlterTable
ALTER TABLE "ItemGroupPValue" DROP CONSTRAINT "ItemGroupPValue_pkey",
ADD COLUMN     "league" TEXT NOT NULL DEFAULT 'NA',
ADD CONSTRAINT "ItemGroupPValue_pkey" PRIMARY KEY ("hashString", "type", "stockRangeStartInclusive", "league");

-- AlterTable
ALTER TABLE "ItemGroupPValueDailyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_pkey",
ADD COLUMN     "league" TEXT NOT NULL DEFAULT 'NA',
ADD CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_pkey" PRIMARY KEY ("hashString", "type", "stockRangeStartInclusive", "timestamp", "league");

-- AlterTable
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_pkey",
ADD COLUMN     "league" TEXT NOT NULL DEFAULT 'NA',
ADD CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_pkey" PRIMARY KEY ("hashString", "type", "stockRangeStartInclusive", "timestamp", "league");

-- AddForeignKey
ALTER TABLE "ItemGroupPValue" ADD CONSTRAINT "ItemGroupPValue_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" ADD CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemGroupPValueDailyTimeseriesEntry" ADD CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE RESTRICT ON UPDATE CASCADE;

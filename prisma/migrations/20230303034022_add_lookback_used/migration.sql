-- AlterTable
ALTER TABLE "ItemGroupPValue" ADD COLUMN     "lookbackWindowUsedHours" INTEGER NOT NULL DEFAULT 48;

-- AlterTable
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" ADD COLUMN     "lookbackWindowUsedHours" INTEGER NOT NULL DEFAULT 48;

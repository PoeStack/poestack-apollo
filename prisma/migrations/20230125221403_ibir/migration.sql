-- DropForeignKey
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_hashString_fkey";

-- AddForeignKey
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" ADD CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE CASCADE ON UPDATE CASCADE;

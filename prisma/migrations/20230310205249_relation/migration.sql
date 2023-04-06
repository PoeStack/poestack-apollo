-- DropForeignKey
ALTER TABLE "ItemGroupPValue" DROP CONSTRAINT "ItemGroupPValue_hashString_fkey";

-- DropForeignKey
ALTER TABLE "ItemGroupPValueDailyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_hashString_fkey";

-- DropForeignKey
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" DROP CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_hashString_fkey";

-- DropForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" DROP CONSTRAINT "StashSnapshotItemGroupSummary_itemGroupHashString_fkey";

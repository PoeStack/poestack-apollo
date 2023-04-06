-- DropForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" DROP CONSTRAINT "StashSnapshotItemGroupSummary_itemGroupHashString_fkey";

-- AlterTable
ALTER TABLE "StashSnapshotItemGroupSummary" ADD COLUMN     "league" TEXT NOT NULL DEFAULT 'NA';

-- AddForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" ADD CONSTRAINT "StashSnapshotItemGroupSummary_itemGroupHashString_fkey" FOREIGN KEY ("itemGroupHashString") REFERENCES "ItemGroup"("hashString") ON DELETE RESTRICT ON UPDATE CASCADE;

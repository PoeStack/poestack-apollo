/*
  Warnings:

  - You are about to drop the column `stashSnapshotExportId` on the `StashSnapshotItemGroupSummary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StashSnapshotItemGroupSummary" DROP COLUMN "stashSnapshotExportId";

-- AddForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" ADD CONSTRAINT "StashSnapshotItemGroupSummary_stashSnapshotId_fkey" FOREIGN KEY ("stashSnapshotId") REFERENCES "StashSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

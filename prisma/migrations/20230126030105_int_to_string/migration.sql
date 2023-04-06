/*
  Warnings:

  - The primary key for the `StashSnapshot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StashSnapshotItemGroupSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" DROP CONSTRAINT "StashSnapshotItemGroupSummary_stashSnapshotId_fkey";

-- AlterTable
ALTER TABLE "StashSnapshot" DROP CONSTRAINT "StashSnapshot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "StashSnapshot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "StashSnapshot_id_seq";

-- AlterTable
ALTER TABLE "StashSnapshotItemGroupSummary" DROP CONSTRAINT "StashSnapshotItemGroupSummary_pkey",
ALTER COLUMN "stashSnapshotId" SET DATA TYPE TEXT,
ADD CONSTRAINT "StashSnapshotItemGroupSummary_pkey" PRIMARY KEY ("itemGroupHashString", "stashSnapshotId");

-- AddForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" ADD CONSTRAINT "StashSnapshotItemGroupSummary_stashSnapshotId_fkey" FOREIGN KEY ("stashSnapshotId") REFERENCES "StashSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

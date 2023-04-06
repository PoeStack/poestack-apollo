/*
  Warnings:

  - You are about to drop the column `lastSnapshotTimestamp` on the `StashSnapshotProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StashSnapshot" ALTER COLUMN "snapshotProfileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StashSnapshotProfile" DROP COLUMN "lastSnapshotTimestamp";

-- AlterTable
ALTER TABLE "StashSnapshotProfile" ADD COLUMN     "automaticSnapshotIntervalMs" INTEGER,
ADD COLUMN     "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSnapshotTimestamp" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PoeCharacter" ADD COLUMN     "lastSnapshotHash" TEXT,
ADD COLUMN     "lastSnapshotHashUpdateTimestamp" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PoeCharacter" ADD COLUMN     "ladderViewNextSnapshotTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

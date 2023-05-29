-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" ADD COLUMN     "mostRecentSnapshot" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "league" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" ALTER COLUMN "mostRecentSnapshot" DROP DEFAULT;

-- CreateTable
CREATE TABLE "LadderViewVectorRecord" (
    "league" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LadderViewVectorRecord_pkey" PRIMARY KEY ("league","timestamp")
);

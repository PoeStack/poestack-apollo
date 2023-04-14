-- AlterTable
ALTER TABLE "StashViewItemSummary" ADD COLUMN     "icon" TEXT;

-- CreateTable
CREATE TABLE "StashViewSnapshotJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentIndex" INTEGER NOT NULL,
    "totalStahes" INTEGER NOT NULL,

    CONSTRAINT "StashViewSnapshotJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashViewTabSnapshotRecord" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "stashId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StashViewTabSnapshotRecord_pkey" PRIMARY KEY ("userId","league","stashId")
);

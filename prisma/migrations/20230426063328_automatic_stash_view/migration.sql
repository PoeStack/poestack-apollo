-- CreateTable
CREATE TABLE "StashViewAutomaticSnapshotSettings" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "stashIds" TEXT[],
    "durationBetweenSnapshotsSeconds" INTEGER NOT NULL,
    "nextSnapshotTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StashViewAutomaticSnapshotSettings_pkey" PRIMARY KEY ("userId","league")
);

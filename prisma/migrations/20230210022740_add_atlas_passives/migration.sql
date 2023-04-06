-- CreateTable
CREATE TABLE "AtlasPassiveTreeSnapshot" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "systemSnapshotTimestamp" TIMESTAMP(3) NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "hashes" INTEGER[],
    "source" TEXT NOT NULL,

    CONSTRAINT "AtlasPassiveTreeSnapshot_pkey" PRIMARY KEY ("userId","league","systemSnapshotTimestamp")
);

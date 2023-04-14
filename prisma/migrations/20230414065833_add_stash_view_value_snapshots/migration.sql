-- CreateTable
CREATE TABLE "StashViewValueSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "stashId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StashViewValueSnapshot_pkey" PRIMARY KEY ("id")
);

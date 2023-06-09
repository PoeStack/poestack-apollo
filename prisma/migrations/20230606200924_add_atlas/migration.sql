-- CreateTable
CREATE TABLE "AtlasViewSnapshot" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashes" TEXT[],
    "hashTypeCounts" JSONB NOT NULL,

    CONSTRAINT "AtlasViewSnapshot_pkey" PRIMARY KEY ("userId","league")
);

-- CreateTable
CREATE TABLE "StashViewItemSummary" (
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "stashId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "stackSize" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "itemGroupHashString" TEXT,
    "itemGroupTag" TEXT,
    "valueChaos" DOUBLE PRECISION,

    CONSTRAINT "StashViewItemSummary_pkey" PRIMARY KEY ("itemId")
);

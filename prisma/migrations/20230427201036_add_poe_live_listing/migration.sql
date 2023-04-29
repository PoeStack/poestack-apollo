-- CreateTable
CREATE TABLE "PoeLiveListing" (
    "id" TEXT NOT NULL,
    "publicStashId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "poeProfileName" TEXT NOT NULL,
    "listedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "itemGroupHashString" TEXT NOT NULL,
    "stackSize" INTEGER NOT NULL,
    "listedValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoeLiveListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoeLiveListing_league_idx" ON "PoeLiveListing"("league");

-- CreateIndex
CREATE INDEX "PoeLiveListing_itemGroupHashString_idx" ON "PoeLiveListing"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "PoeLiveListing_publicStashId_idx" ON "PoeLiveListing"("publicStashId");

-- CreateIndex
CREATE INDEX "PoeLiveListing_listedAtTimestamp_idx" ON "PoeLiveListing"("listedAtTimestamp");

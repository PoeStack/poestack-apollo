/*
  Warnings:

  - You are about to drop the `PoeStatBasedItemListingRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PoeStatBasedItemListingRecord";

-- CreateTable
CREATE TABLE "PoeCrucibleItemListing" (
    "id" TEXT NOT NULL,
    "publicStashId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "listedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "itemBaseType" TEXT,
    "itemName" TEXT,
    "itemLevel" INTEGER NOT NULL,
    "corrupted" BOOLEAN NOT NULL,
    "crucibleSkillIds" INTEGER[],
    "listedValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoeCrucibleItemListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_league_idx" ON "PoeCrucibleItemListing"("league");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_itemBaseType_idx" ON "PoeCrucibleItemListing"("itemBaseType");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_itemLevel_idx" ON "PoeCrucibleItemListing"("itemLevel");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_publicStashId_idx" ON "PoeCrucibleItemListing"("publicStashId");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_listedAtTimestamp_idx" ON "PoeCrucibleItemListing"("listedAtTimestamp");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_listedValue_idx" ON "PoeCrucibleItemListing"("listedValue");

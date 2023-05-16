/*
  Warnings:

  - You are about to drop the `StashViewItemSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StashViewTabSnapshotRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "StashViewItemSummary";

-- DropTable
DROP TABLE "StashViewTabSnapshotRecord";

-- CreateTable
CREATE TABLE "StashViewSnapshotRecord" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "favorited" BOOLEAN NOT NULL,
    "name" TEXT,

    CONSTRAINT "StashViewSnapshotRecord_pkey" PRIMARY KEY ("userId","league","timestamp")
);

-- CreateTable
CREATE TABLE "LivePricingHistoryDayEntry" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minQuantityInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivePricingHistoryDayEntry_pkey" PRIMARY KEY ("itemGroupHashString","league","type","minQuantityInclusive","timestamp")
);

-- CreateTable
CREATE TABLE "LivePricingHistoryFixedLastEntry" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LivePricingHistoryFixedLastEntry_pkey" PRIMARY KEY ("itemGroupHashString","league")
);

-- CreateIndex
CREATE INDEX "StashViewSnapshotRecord_userId_idx" ON "StashViewSnapshotRecord"("userId");

-- CreateIndex
CREATE INDEX "LivePricingHistoryDayEntry_itemGroupHashString_idx" ON "LivePricingHistoryDayEntry"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "LivePricingHistoryDayEntry_timestamp_idx" ON "LivePricingHistoryDayEntry"("timestamp");

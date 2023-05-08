-- AlterTable
ALTER TABLE "StashViewSnapshotJob" ADD COLUMN     "rateLimitEndTimestamp" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LivePricingHistoryHourEntry" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minQuantityInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivePricingHistoryHourEntry_pkey" PRIMARY KEY ("itemGroupHashString","league","type","minQuantityInclusive","timestamp")
);

-- CreateIndex
CREATE INDEX "LivePricingHistoryHourEntry_itemGroupHashString_idx" ON "LivePricingHistoryHourEntry"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "LivePricingHistoryHourEntry_timestamp_idx" ON "LivePricingHistoryHourEntry"("timestamp");

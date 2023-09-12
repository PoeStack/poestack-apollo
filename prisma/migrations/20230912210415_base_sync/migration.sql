-- AlterTable
ALTER TABLE "LivePricingHistoryHourEntry" RENAME CONSTRAINT "LivePricingHistoryHourEntry2_pkey" TO "LivePricingHistoryHourEntry_pkey";

-- RenameIndex
ALTER INDEX "LivePricingHistoryHourEntry2_itemGroupHashString_idx" RENAME TO "LivePricingHistoryHourEntry_itemGroupHashString_idx";

-- RenameIndex
ALTER INDEX "LivePricingHistoryHourEntry2_timestamp_idx" RENAME TO "LivePricingHistoryHourEntry_timestamp_idx";

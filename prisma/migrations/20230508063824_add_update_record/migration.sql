-- CreateTable
CREATE TABLE "LivePricingHistoryUpdateRecord" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivePricingHistoryUpdateRecord_pkey" PRIMARY KEY ("itemGroupHashString","league")
);

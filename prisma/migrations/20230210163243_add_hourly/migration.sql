-- CreateTable
CREATE TABLE "ItemGroupPValueDailyTimeseriesEntry" (
    "hashString" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stockRangeStartInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_pkey" PRIMARY KEY ("hashString","type","stockRangeStartInclusive","timestamp")
);

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_hashString_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_timestamp_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("timestamp");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_type_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("type");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_stockRangeStartInclusiv_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("stockRangeStartInclusive");

-- AddForeignKey
ALTER TABLE "ItemGroupPValueDailyTimeseriesEntry" ADD CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE CASCADE ON UPDATE CASCADE;

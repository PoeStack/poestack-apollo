-- CreateIndex
CREATE INDEX "ItemGroupPValue_hashString_idx" ON "ItemGroupPValue"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_updatedAtTimestamp_idx" ON "ItemGroupPValue"("updatedAtTimestamp");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_type_idx" ON "ItemGroupPValue"("type");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_stockRangeStartInclusive_idx" ON "ItemGroupPValue"("stockRangeStartInclusive");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_hashString_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_timestamp_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("timestamp");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_type_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("type");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_stockRangeStartInclusi_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("stockRangeStartInclusive");

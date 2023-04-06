-- CreateIndex
CREATE INDEX "AtlasPassiveTreeSnapshot_userId_systemSnapshotTimestamp_idx" ON "AtlasPassiveTreeSnapshot"("userId", "systemSnapshotTimestamp");

-- CreateIndex
CREATE INDEX "AtlasPassiveTreeSnapshot_league_idx" ON "AtlasPassiveTreeSnapshot"("league");

-- CreateIndex
CREATE INDEX "AtlasPassiveTreeSnapshot_source_idx" ON "AtlasPassiveTreeSnapshot"("source");

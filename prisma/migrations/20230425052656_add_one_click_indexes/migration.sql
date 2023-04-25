-- CreateIndex
CREATE INDEX "OneClickMessageHistory_userId_idx" ON "OneClickMessageHistory"("userId");

-- CreateIndex
CREATE INDEX "StashViewSnapshotJob_userId_idx" ON "StashViewSnapshotJob"("userId");

-- CreateIndex
CREATE INDEX "StashViewTabSnapshotRecord_userId_idx" ON "StashViewTabSnapshotRecord"("userId");

-- CreateIndex
CREATE INDEX "StashViewValueSnapshot_userId_idx" ON "StashViewValueSnapshot"("userId");

-- CreateIndex
CREATE INDEX "StashSnapshotItemGroupSummary_userId_idx" ON "StashSnapshotItemGroupSummary"("userId");

-- CreateIndex
CREATE INDEX "StashSnapshotItemGroupSummary_stashSnapshotId_idx" ON "StashSnapshotItemGroupSummary"("stashSnapshotId");

-- CreateIndex
CREATE INDEX "StashSnapshotItemGroupSummary_itemGroupHashString_idx" ON "StashSnapshotItemGroupSummary"("itemGroupHashString");

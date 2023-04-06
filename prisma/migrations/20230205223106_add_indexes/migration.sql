-- CreateIndex
CREATE INDEX "CharacterSnapshot_league_idx" ON "CharacterSnapshot"("league");

-- CreateIndex
CREATE INDEX "CharacterSnapshot_characterId_idx" ON "CharacterSnapshot"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotItem_mainSkill_idx" ON "CharacterSnapshotItem"("mainSkill");

-- CreateIndex
CREATE INDEX "CharacterSnapshotItem_snapshotId_idx" ON "CharacterSnapshotItem"("snapshotId");

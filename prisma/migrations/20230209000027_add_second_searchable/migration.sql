-- CreateTable
CREATE TABLE "CharacterSnapshotSearchableSummary2" (
    "snapshotId" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "systemSnapshotTimestamp" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'user',
    "league" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "characterClass" TEXT NOT NULL,
    "mainSkillKey" TEXT NOT NULL,
    "passiveNodeKeys" TEXT[],
    "itemKeys" TEXT[],

    CONSTRAINT "CharacterSnapshotSearchableSummary2_pkey" PRIMARY KEY ("snapshotId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary2_snapshotId_key" ON "CharacterSnapshotSearchableSummary2"("snapshotId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_characterId_idx" ON "CharacterSnapshotSearchableSummary2"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_createdAtTimestamp_idx" ON "CharacterSnapshotSearchableSummary2"("createdAtTimestamp");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_mainSkillKey_idx" ON "CharacterSnapshotSearchableSummary2"("mainSkillKey");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_league_idx" ON "CharacterSnapshotSearchableSummary2"("league");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_characterClass_idx" ON "CharacterSnapshotSearchableSummary2"("characterClass");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_passiveNodeKeys_idx" ON "CharacterSnapshotSearchableSummary2"("passiveNodeKeys");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_itemKeys_idx" ON "CharacterSnapshotSearchableSummary2"("itemKeys");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_systemSnapshotTimestamp_idx" ON "CharacterSnapshotSearchableSummary2"("systemSnapshotTimestamp");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_source_idx" ON "CharacterSnapshotSearchableSummary2"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary2_characterId_systemSnaps_key" ON "CharacterSnapshotSearchableSummary2"("characterId", "systemSnapshotTimestamp");

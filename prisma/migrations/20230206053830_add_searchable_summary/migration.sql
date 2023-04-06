-- CreateTable
CREATE TABLE "PoeCharacterSnapshotSearchableSummary" (
    "snapshotId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "assendancyClassName" TEXT NOT NULL,
    "mainSkill" TEXT NOT NULL,
    "passiveNodeHashes" INTEGER[],

    CONSTRAINT "PoeCharacterSnapshotSearchableSummary_pkey" PRIMARY KEY ("snapshotId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoeCharacterSnapshotSearchableSummary_snapshotId_key" ON "PoeCharacterSnapshotSearchableSummary"("snapshotId");

-- CreateIndex
CREATE INDEX "PoeCharacterSnapshotSearchableSummary_mainSkill_idx" ON "PoeCharacterSnapshotSearchableSummary"("mainSkill");

-- CreateIndex
CREATE INDEX "PoeCharacterSnapshotSearchableSummary_league_idx" ON "PoeCharacterSnapshotSearchableSummary"("league");

-- CreateIndex
CREATE INDEX "PoeCharacterSnapshotSearchableSummary_assendancyClassName_idx" ON "PoeCharacterSnapshotSearchableSummary"("assendancyClassName");

-- CreateIndex
CREATE INDEX "PoeCharacterSnapshotSearchableSummary_passiveNodeHashes_idx" ON "PoeCharacterSnapshotSearchableSummary"("passiveNodeHashes");

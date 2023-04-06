/*
  Warnings:

  - You are about to drop the `PoeCharacterSnapshotSearchableSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PoeCharacterSnapshotSearchableSummary";

-- CreateTable
CREATE TABLE "CharacterSnapshotSearchableSummary" (
    "snapshotId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "assendancyClassName" TEXT NOT NULL,
    "mainSkill" TEXT NOT NULL,
    "passiveNodeHashes" INTEGER[],
    "itemKeys" TEXT[],

    CONSTRAINT "CharacterSnapshotSearchableSummary_pkey" PRIMARY KEY ("snapshotId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary_snapshotId_key" ON "CharacterSnapshotSearchableSummary"("snapshotId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_mainSkill_idx" ON "CharacterSnapshotSearchableSummary"("mainSkill");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_league_idx" ON "CharacterSnapshotSearchableSummary"("league");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_assendancyClassName_idx" ON "CharacterSnapshotSearchableSummary"("assendancyClassName");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_passiveNodeHashes_idx" ON "CharacterSnapshotSearchableSummary"("passiveNodeHashes");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_itemKeys_idx" ON "CharacterSnapshotSearchableSummary"("itemKeys");

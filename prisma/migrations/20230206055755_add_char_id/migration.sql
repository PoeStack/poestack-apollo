/*
  Warnings:

  - Added the required column `characterId` to the `CharacterSnapshotSearchableSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary" ADD COLUMN     "characterId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_characterId_idx" ON "CharacterSnapshotSearchableSummary"("characterId");

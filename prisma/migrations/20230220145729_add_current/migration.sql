-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" ADD COLUMN     "current" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_current_idx" ON "CharacterSnapshotSearchableSummary2"("current");

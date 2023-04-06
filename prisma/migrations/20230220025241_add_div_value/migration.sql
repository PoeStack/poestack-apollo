-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" ADD COLUMN     "totalValueDivine" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_totalValueDivine_idx" ON "CharacterSnapshotSearchableSummary2"("totalValueDivine");

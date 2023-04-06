-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" ADD COLUMN     "totalValueChaosBucketed" INTEGER;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_totalValueChaosBucketed_idx" ON "CharacterSnapshotSearchableSummary2"("totalValueChaosBucketed");

-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "systemSnapshotTimestamp" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_systemSnapshotTimestamp_idx" ON "CharacterSnapshotSearchableSummary"("systemSnapshotTimestamp");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_source_idx" ON "CharacterSnapshotSearchableSummary"("source");

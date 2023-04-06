-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_userId_idx" ON "CharacterSnapshotSearchableSummary2"("userId");

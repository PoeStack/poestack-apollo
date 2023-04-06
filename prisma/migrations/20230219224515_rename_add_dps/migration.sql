/*
  Warnings:

  - You are about to drop the column `totalValueChaosBucketed` on the `CharacterSnapshotSearchableSummary2` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CharacterSnapshotSearchableSummary2_totalValueChaosBucketed_idx";

-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" DROP COLUMN "totalValueChaosBucketed",
ADD COLUMN     "pobDps" INTEGER,
ADD COLUMN     "totalValueChaos" INTEGER;

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_totalValueChaos_idx" ON "CharacterSnapshotSearchableSummary2"("totalValueChaos");

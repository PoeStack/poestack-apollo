/*
  Warnings:

  - You are about to drop the column `passiveNodeHashes` on the `CharacterSnapshotSearchableSummary` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CharacterSnapshotSearchableSummary_passiveNodeHashes_idx";

-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary" DROP COLUMN "passiveNodeHashes",
ADD COLUMN     "passiveNodeKeys" TEXT[];

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary_passiveNodeKeys_idx" ON "CharacterSnapshotSearchableSummary"("passiveNodeKeys");

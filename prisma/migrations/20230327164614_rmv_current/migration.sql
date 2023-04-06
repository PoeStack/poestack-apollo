/*
  Warnings:

  - The primary key for the `CharacterSnapshotSearchableSummary2` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `current` on the `CharacterSnapshotSearchableSummary2` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[characterId]` on the table `CharacterSnapshotSearchableSummary2` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CharacterSnapshotSearchableSummary2_characterId_systemSnaps_key";

-- DropIndex
DROP INDEX "CharacterSnapshotSearchableSummary2_current_idx";

-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" DROP CONSTRAINT "CharacterSnapshotSearchableSummary2_pkey",
DROP COLUMN "current",
ADD CONSTRAINT "CharacterSnapshotSearchableSummary2_pkey" PRIMARY KEY ("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary2_characterId_key" ON "CharacterSnapshotSearchableSummary2"("characterId");

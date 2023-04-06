/*
  Warnings:

  - You are about to drop the column `es` on the `CharacterSnapshotSearchableSummary2` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" DROP COLUMN "es",
ADD COLUMN     "energyShield" INTEGER,
ADD COLUMN     "level" INTEGER;

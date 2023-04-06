/*
  Warnings:

  - You are about to drop the column `topUniqueNames` on the `CharacterSnapshotSearchableSummary2` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" DROP COLUMN "topUniqueNames",
ADD COLUMN     "topItemKeys" TEXT[];

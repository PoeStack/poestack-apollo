/*
  Warnings:

  - You are about to drop the column `topItemKeys` on the `CharacterSnapshotSearchableSummary2` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshotSearchableSummary2" DROP COLUMN "topItemKeys",
ADD COLUMN     "topItems" JSONB[];

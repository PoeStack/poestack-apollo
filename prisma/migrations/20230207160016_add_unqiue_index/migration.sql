/*
  Warnings:

  - A unique constraint covering the columns `[characterId,systemSnapshotTimestamp]` on the table `CharacterSnapshotSearchableSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary_characterId_systemSnapsh_key" ON "CharacterSnapshotSearchableSummary"("characterId", "systemSnapshotTimestamp");

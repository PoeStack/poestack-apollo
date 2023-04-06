/*
  Warnings:

  - You are about to drop the `StashSnapshotExport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "StashSnapshotExport";

-- CreateTable
CREATE TABLE "CharacterPassivesSnapshotRecord" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterPassivesSnapshotRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterPassivesSnapshotRecord_id_key" ON "CharacterPassivesSnapshotRecord"("id");

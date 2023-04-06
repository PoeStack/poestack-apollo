/*
  Warnings:

  - You are about to drop the `CharacterPassivesSnapshotRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CharacterPassivesSnapshotRecord";

-- CreateTable
CREATE TABLE "CharacterSnapshotRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "experience" BIGINT NOT NULL,
    "level" INTEGER NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "CharacterSnapshotRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotRecord_id_key" ON "CharacterSnapshotRecord"("id");

/*
  Warnings:

  - The primary key for the `CharacterSnapshot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `CharacterSnapshot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[characterId,timestamp]` on the table `CharacterSnapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `banditChoice` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `current` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pantheonMajor` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pantheonMinor` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshot" DROP CONSTRAINT "CharacterSnapshot_pkey",
ADD COLUMN     "banditChoice" TEXT NOT NULL,
ADD COLUMN     "current" BOOLEAN NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "pantheonMajor" TEXT NOT NULL,
ADD COLUMN     "pantheonMinor" TEXT NOT NULL,
ADD CONSTRAINT "CharacterSnapshot_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "CharacterPassivesSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "banditChoice" TEXT NOT NULL,
    "pantheonMajor" TEXT NOT NULL,
    "pantheonMinor" TEXT NOT NULL,
    "hashes" JSONB NOT NULL,
    "hashesEx" JSONB NOT NULL,
    "jewels" JSONB NOT NULL,
    "jewelData" JSONB NOT NULL,
    "masteryEffects" JSONB NOT NULL,

    CONSTRAINT "CharacterPassivesSnapshot_pkey" PRIMARY KEY ("snapshotId")
);

-- CreateTable
CREATE TABLE "CharacterSnapshotItem" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "baseType" TEXT NOT NULL,
    "typeLine" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ilvl" INTEGER NOT NULL,
    "explicitMods" TEXT[],
    "utilityMods" TEXT[],
    "properties" JSONB[],
    "requirements" JSONB[],
    "frameType" INTEGER NOT NULL,
    "flavourText" TEXT[],
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,

    CONSTRAINT "CharacterSnapshotItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterPassivesSnapshot_snapshotId_key" ON "CharacterPassivesSnapshot"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshot_id_key" ON "CharacterSnapshot"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshot_characterId_timestamp_key" ON "CharacterSnapshot"("characterId", "timestamp");

-- AddForeignKey
ALTER TABLE "CharacterPassivesSnapshot" ADD CONSTRAINT "CharacterPassivesSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CharacterSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSnapshotItem" ADD CONSTRAINT "CharacterSnapshotItem_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CharacterSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

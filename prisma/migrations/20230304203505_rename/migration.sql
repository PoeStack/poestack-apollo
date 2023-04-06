/*
  Warnings:

  - You are about to drop the column `poeCharacterName` on the `PoeLadderItemSummary` table. All the data in the column will be lost.
  - Added the required column `poeCharacterId` to the `PoeLadderItemSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PoeLadderItemSummary_poeCharacterName_idx";

-- AlterTable
ALTER TABLE "PoeLadderItemSummary" DROP COLUMN "poeCharacterName",
ADD COLUMN     "poeCharacterId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PoeLadderItemSummary_poeCharacterId_idx" ON "PoeLadderItemSummary"("poeCharacterId");

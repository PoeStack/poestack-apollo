-- AlterTable
ALTER TABLE "PoeProfileToCharacterMapping" ADD COLUMN     "lastLeague" TEXT;

-- CreateIndex
CREATE INDEX "PoeProfileToCharacterMapping_lastLeague_idx" ON "PoeProfileToCharacterMapping"("lastLeague");

/*
  Warnings:

  - You are about to drop the `LadderViewSnapshotRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LadderViewSnapshotRecord";

-- CreateTable
CREATE TABLE "LadderViewSnapshot" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "characterOpaqueKey" TEXT NOT NULL,
    "lastestSnapshot" BOOLEAN NOT NULL,
    "characterApiFields" JSONB NOT NULL,
    "pobStatus" TEXT NOT NULL,
    "characterPobFields" JSONB NOT NULL,

    CONSTRAINT "LadderViewSnapshot_pkey" PRIMARY KEY ("userId","characterId","timestamp")
);

-- CreateIndex
CREATE INDEX "LadderViewSnapshot_userId_idx" ON "LadderViewSnapshot"("userId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshot_characterOpaqueKey_idx" ON "LadderViewSnapshot"("characterOpaqueKey");

-- CreateIndex
CREATE INDEX "LadderViewSnapshot_characterId_idx" ON "LadderViewSnapshot"("characterId");

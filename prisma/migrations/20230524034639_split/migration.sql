/*
  Warnings:

  - You are about to drop the `LadderViewSnapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LadderViewSnapshot";

-- CreateTable
CREATE TABLE "LadderViewSnapshotRecord" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "snapshotHashString" TEXT NOT NULL,
    "lastestSnapshot" BOOLEAN NOT NULL,
    "pobStatus" TEXT NOT NULL,
    "pobShardKey" INTEGER NOT NULL,

    CONSTRAINT "LadderViewSnapshotRecord_pkey" PRIMARY KEY ("userId","characterId","timestamp")
);

-- CreateTable
CREATE TABLE "LadderViewSnapshotVectorSummary" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "characterApiFields" JSONB NOT NULL,
    "characterPobFields" JSONB NOT NULL,

    CONSTRAINT "LadderViewSnapshotVectorSummary_pkey" PRIMARY KEY ("userId","characterId")
);

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_userId_idx" ON "LadderViewSnapshotRecord"("userId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_characterId_idx" ON "LadderViewSnapshotRecord"("characterId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotVectorSummary_userId_idx" ON "LadderViewSnapshotVectorSummary"("userId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotVectorSummary_characterId_idx" ON "LadderViewSnapshotVectorSummary"("characterId");

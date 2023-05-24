-- AlterTable
ALTER TABLE "PoeCharacter" ADD COLUMN     "opaqueKey" TEXT;

-- CreateTable
CREATE TABLE "LadderViewSnapshotRecord" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "characterOpaqueKey" TEXT NOT NULL,
    "lastestSnapshot" BOOLEAN NOT NULL,
    "characterVectorFields" JSONB NOT NULL,

    CONSTRAINT "LadderViewSnapshotRecord_pkey" PRIMARY KEY ("userId","characterId","timestamp")
);

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_userId_idx" ON "LadderViewSnapshotRecord"("userId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_characterOpaqueKey_idx" ON "LadderViewSnapshotRecord"("characterOpaqueKey");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_characterId_idx" ON "LadderViewSnapshotRecord"("characterId");

-- CreateIndex
CREATE INDEX "PoeCharacter_opaqueKey_idx" ON "PoeCharacter"("opaqueKey");

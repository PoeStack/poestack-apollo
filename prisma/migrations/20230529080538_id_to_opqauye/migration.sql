/*
  Warnings:

  - The primary key for the `LadderViewSnapshotRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `characterId` on the `LadderViewSnapshotRecord` table. All the data in the column will be lost.
  - Added the required column `characterOpquaeKey` to the `LadderViewSnapshotRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LadderViewSnapshotRecord_characterId_idx";

-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" DROP CONSTRAINT "LadderViewSnapshotRecord_pkey",
DROP COLUMN "characterId",
ADD COLUMN     "characterOpquaeKey" TEXT NOT NULL,
ADD CONSTRAINT "LadderViewSnapshotRecord_pkey" PRIMARY KEY ("userId", "characterOpquaeKey", "timestamp");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_characterOpquaeKey_idx" ON "LadderViewSnapshotRecord"("characterOpquaeKey");

/*
  Warnings:

  - The primary key for the `LadderViewSnapshotRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `characterOpquaeKey` on the `LadderViewSnapshotRecord` table. All the data in the column will be lost.
  - Added the required column `characterOpaqueKey` to the `LadderViewSnapshotRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LadderViewSnapshotRecord_characterOpquaeKey_idx";

-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" DROP CONSTRAINT "LadderViewSnapshotRecord_pkey",
DROP COLUMN "characterOpquaeKey",
ADD COLUMN     "characterOpaqueKey" TEXT NOT NULL,
ADD CONSTRAINT "LadderViewSnapshotRecord_pkey" PRIMARY KEY ("userId", "characterOpaqueKey", "timestamp");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_characterOpaqueKey_idx" ON "LadderViewSnapshotRecord"("characterOpaqueKey");

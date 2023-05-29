/*
  Warnings:

  - The primary key for the `LadderViewSnapshotVectorSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `characterId` on the `LadderViewSnapshotVectorSummary` table. All the data in the column will be lost.
  - Added the required column `characterOpaqueKey` to the `LadderViewSnapshotVectorSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LadderViewSnapshotVectorSummary_characterId_idx";

-- AlterTable
ALTER TABLE "LadderViewSnapshotVectorSummary" DROP CONSTRAINT "LadderViewSnapshotVectorSummary_pkey",
DROP COLUMN "characterId",
ADD COLUMN     "characterOpaqueKey" TEXT NOT NULL,
ADD CONSTRAINT "LadderViewSnapshotVectorSummary_pkey" PRIMARY KEY ("userId", "characterOpaqueKey");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotVectorSummary_characterOpaqueKey_idx" ON "LadderViewSnapshotVectorSummary"("characterOpaqueKey");

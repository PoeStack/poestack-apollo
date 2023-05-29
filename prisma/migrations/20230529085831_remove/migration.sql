/*
  Warnings:

  - You are about to drop the column `lastestSnapshot` on the `LadderViewSnapshotRecord` table. All the data in the column will be lost.
  - You are about to drop the `LadderViewSnapshotVectorSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" DROP COLUMN "lastestSnapshot",
ADD COLUMN     "characterApiFields" JSONB,
ADD COLUMN     "characterPobFields" JSONB;

-- DropTable
DROP TABLE "LadderViewSnapshotVectorSummary";

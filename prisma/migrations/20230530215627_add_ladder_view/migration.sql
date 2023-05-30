/*
  Warnings:

  - You are about to drop the column `ladderViewNextSnapshotTimestamp` on the `PoeCharacter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoeCharacter" DROP COLUMN "ladderViewNextSnapshotTimestamp",
ADD COLUMN     "ladderViewLastSnapshotHash" TEXT,
ADD COLUMN     "ladderViewLastSnapshotHashUpdateTimestamp" TIMESTAMP(3);

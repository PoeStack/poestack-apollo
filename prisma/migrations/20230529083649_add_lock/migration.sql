/*
  Warnings:

  - You are about to drop the column `pobShardKey` on the `LadderViewSnapshotRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" DROP COLUMN "pobShardKey",
ADD COLUMN     "lockKey" TEXT,
ADD COLUMN     "lockTimestamp" TIMESTAMP(3);

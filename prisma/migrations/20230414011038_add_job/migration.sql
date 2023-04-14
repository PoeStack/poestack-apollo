/*
  Warnings:

  - You are about to drop the column `currentIndex` on the `StashViewSnapshotJob` table. All the data in the column will be lost.
  - Added the required column `timestamp` to the `StashViewSnapshotJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StashViewSnapshotJob" DROP COLUMN "currentIndex",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

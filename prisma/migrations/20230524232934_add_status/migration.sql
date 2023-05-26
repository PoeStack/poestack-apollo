/*
  Warnings:

  - You are about to drop the column `pobStatus` on the `LadderViewSnapshotRecord` table. All the data in the column will be lost.
  - Added the required column `snapshotStatus` to the `LadderViewSnapshotRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" DROP COLUMN "pobStatus",
ADD COLUMN     "snapshotStatus" TEXT NOT NULL;

/*
  Warnings:

  - Made the column `characterApiFields` on table `LadderViewSnapshotRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `characterPobFields` on table `LadderViewSnapshotRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LadderViewSnapshotRecord" ALTER COLUMN "characterApiFields" SET NOT NULL,
ALTER COLUMN "characterPobFields" SET NOT NULL;

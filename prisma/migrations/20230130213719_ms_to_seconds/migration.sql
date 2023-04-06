/*
  Warnings:

  - You are about to drop the column `automaticSnapshotIntervalMs` on the `StashSnapshotProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StashSnapshotProfile" DROP COLUMN "automaticSnapshotIntervalMs",
ADD COLUMN     "automaticSnapshotIntervalSeconds" INTEGER;

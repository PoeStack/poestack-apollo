/*
  Warnings:

  - You are about to alter the column `totalDpsWithIgnite` on the `CharacterSnapshotPobStats` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshotPobStats" ALTER COLUMN "totalDpsWithIgnite" SET DATA TYPE INTEGER;

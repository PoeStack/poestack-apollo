/*
  Warnings:

  - You are about to drop the column `banditChoice` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `pantheonMajor` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `pantheonMinor` on the `CharacterSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshot" DROP COLUMN "banditChoice",
DROP COLUMN "pantheonMajor",
DROP COLUMN "pantheonMinor";

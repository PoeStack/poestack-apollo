/*
  Warnings:

  - Added the required column `userDiscordName` to the `TftLiveListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TftLiveListing" ADD COLUMN     "userDiscordName" TEXT NOT NULL;

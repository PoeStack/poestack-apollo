/*
  Warnings:

  - Added the required column `body` to the `TftLiveListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TftLiveListing" ADD COLUMN     "body" TEXT NOT NULL;

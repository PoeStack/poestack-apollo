/*
  Warnings:

  - Added the required column `frameType` to the `PoeCrucibleItemListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PoeCrucibleItemListing" ADD COLUMN     "frameType" INTEGER NOT NULL,
ADD COLUMN     "itemBaseGroup" TEXT;

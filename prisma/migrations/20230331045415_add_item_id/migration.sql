/*
  Warnings:

  - Added the required column `itemId` to the `PoeCrucibleItemListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PoeCrucibleItemListing" ADD COLUMN     "itemId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListing_itemId_idx" ON "PoeCrucibleItemListing"("itemId");

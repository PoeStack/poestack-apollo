/*
  Warnings:

  - You are about to drop the column `stackSize` on the `StashViewItemSummary` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `StashViewItemSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StashViewItemSummary" DROP COLUMN "stackSize",
ADD COLUMN     "quantity" INTEGER NOT NULL;

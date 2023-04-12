/*
  Warnings:

  - You are about to drop the column `key` on the `StashViewItemSummary` table. All the data in the column will be lost.
  - Added the required column `searchableString` to the `StashViewItemSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StashViewItemSummary" DROP COLUMN "key",
ADD COLUMN     "searchableString" TEXT NOT NULL;

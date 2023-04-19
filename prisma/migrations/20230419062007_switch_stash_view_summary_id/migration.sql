/*
  Warnings:

  - The primary key for the `StashViewItemSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "StashViewItemSummary" DROP CONSTRAINT "StashViewItemSummary_pkey",
ADD CONSTRAINT "StashViewItemSummary_pkey" PRIMARY KEY ("userId", "stashId", "x", "y");

-- CreateIndex
CREATE INDEX "StashViewItemSummary_userId_idx" ON "StashViewItemSummary"("userId");

-- CreateIndex
CREATE INDEX "StashViewItemSummary_league_idx" ON "StashViewItemSummary"("league");

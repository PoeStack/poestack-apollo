/*
  Warnings:

  - You are about to drop the column `folder` on the `StashViewTabSummary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StashViewTabSummary" DROP COLUMN "folder";

-- CreateIndex
CREATE INDEX "StashViewTabSummary_userId_idx" ON "StashViewTabSummary"("userId");

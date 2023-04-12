/*
  Warnings:

  - The primary key for the `StashViewTabSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `league` to the `StashViewTabSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StashViewTabSummary" DROP CONSTRAINT "StashViewTabSummary_pkey",
ADD COLUMN     "league" TEXT NOT NULL,
ADD CONSTRAINT "StashViewTabSummary_pkey" PRIMARY KEY ("userId", "stashId", "league");

/*
  Warnings:

  - The primary key for the `StashViewTabSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `createdAtTimestamp` to the `StashViewTabSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StashViewTabSummary" DROP CONSTRAINT "StashViewTabSummary_pkey",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "folder" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "summary" DROP NOT NULL,
ADD CONSTRAINT "StashViewTabSummary_pkey" PRIMARY KEY ("userId", "stashId");

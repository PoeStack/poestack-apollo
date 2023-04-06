/*
  Warnings:

  - The primary key for the `PoePublicStashUpdateRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "PoePublicStashUpdateRecord" DROP CONSTRAINT "PoePublicStashUpdateRecord_pkey",
ADD CONSTRAINT "PoePublicStashUpdateRecord_pkey" PRIMARY KEY ("publicStashId");

-- CreateIndex
CREATE INDEX "PoePublicStashUpdateRecord_league_idx" ON "PoePublicStashUpdateRecord"("league");

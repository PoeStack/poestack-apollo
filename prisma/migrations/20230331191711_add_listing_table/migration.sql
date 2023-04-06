/*
  Warnings:

  - You are about to drop the column `crucibleSkillIds` on the `PoeCrucibleItemListing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoeCrucibleItemListing" DROP COLUMN "crucibleSkillIds";

-- CreateTable
CREATE TABLE "PoeCrucibleItemListingSkillPaths" (
    "id" TEXT NOT NULL,
    "publicStashId" TEXT NOT NULL,
    "crucibleItemListingId" TEXT NOT NULL,
    "skillPathIds" INTEGER[],

    CONSTRAINT "PoeCrucibleItemListingSkillPaths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListingSkillPaths_publicStashId_idx" ON "PoeCrucibleItemListingSkillPaths"("publicStashId");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListingSkillPaths_crucibleItemListingId_idx" ON "PoeCrucibleItemListingSkillPaths"("crucibleItemListingId");

-- CreateIndex
CREATE INDEX "PoeCrucibleItemListingSkillPaths_skillPathIds_idx" ON "PoeCrucibleItemListingSkillPaths"("skillPathIds");

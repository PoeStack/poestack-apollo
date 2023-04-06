/*
  Warnings:

  - You are about to drop the column `explicit0Type` on the `PoeLadderItemSummary` table. All the data in the column will be lost.
  - You are about to drop the column `explicit1Type` on the `PoeLadderItemSummary` table. All the data in the column will be lost.
  - You are about to drop the column `explicit2Type` on the `PoeLadderItemSummary` table. All the data in the column will be lost.
  - You are about to drop the column `explicit3Type` on the `PoeLadderItemSummary` table. All the data in the column will be lost.
  - You are about to drop the column `explicit4Type` on the `PoeLadderItemSummary` table. All the data in the column will be lost.
  - You are about to drop the column `explicit5Type` on the `PoeLadderItemSummary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoeLadderItemSummary" DROP COLUMN "explicit0Type",
DROP COLUMN "explicit1Type",
DROP COLUMN "explicit2Type",
DROP COLUMN "explicit3Type",
DROP COLUMN "explicit4Type",
DROP COLUMN "explicit5Type",
ADD COLUMN     "explicitModTypes" TEXT[];

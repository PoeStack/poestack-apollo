/*
  Warnings:

  - You are about to drop the column `stackSize` on the `PoeLiveListing` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `PoeLiveListing` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PoeLiveListing_listedAtTimestamp_idx";

-- AlterTable
ALTER TABLE "PoeLiveListing" DROP COLUMN "stackSize",
ADD COLUMN     "quantity" INTEGER NOT NULL;

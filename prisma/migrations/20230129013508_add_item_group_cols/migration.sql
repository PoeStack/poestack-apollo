/*
  Warnings:

  - You are about to drop the `ItemGroupStats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemGroupStats" DROP CONSTRAINT "ItemGroupStats_hashString_fkey";

-- AlterTable
ALTER TABLE "ItemGroup" ADD COLUMN     "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valueHistoryLastUpdateWithListingsTimestamp" TIMESTAMP(3),
ADD COLUMN     "valueHistoryUpdatedAtTimestamp" TIMESTAMP(3);

-- DropTable
DROP TABLE "ItemGroupStats";

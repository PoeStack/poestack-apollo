/*
  Warnings:

  - Made the column `totalListings` on table `ItemGroupStats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ItemGroupStats" ALTER COLUMN "totalListings" SET NOT NULL;

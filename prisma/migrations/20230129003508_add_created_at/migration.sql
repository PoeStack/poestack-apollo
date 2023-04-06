/*
  Warnings:

  - Added the required column `createdAtTimestamp` to the `ItemGroupStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItemGroupStats" ADD COLUMN     "createdAtTimestamp" TIMESTAMP(3) NOT NULL;

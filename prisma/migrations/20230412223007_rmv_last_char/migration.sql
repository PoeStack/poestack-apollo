/*
  Warnings:

  - You are about to drop the column `lastPoeCharacterName` on the `PoePublicStashUpdateRecord` table. All the data in the column will be lost.
  - You are about to drop the `PoeProfileToCharacterMapping` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "PoePublicStashUpdateRecord_lastPoeCharacterName_idx";

-- AlterTable
ALTER TABLE "PoePublicStashUpdateRecord" DROP COLUMN "lastPoeCharacterName";

-- DropTable
DROP TABLE "PoeProfileToCharacterMapping";

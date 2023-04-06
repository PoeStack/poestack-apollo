/*
  Warnings:

  - You are about to drop the column `expereince` on the `CharacterSnapshot` table. All the data in the column will be lost.
  - Added the required column `experience` to the `CharacterSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterSnapshot" DROP COLUMN "expereince",
ADD COLUMN     "experience" INTEGER NOT NULL;

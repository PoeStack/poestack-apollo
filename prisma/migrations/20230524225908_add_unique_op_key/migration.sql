/*
  Warnings:

  - A unique constraint covering the columns `[opaqueKey]` on the table `PoeCharacter` will be added. If there are existing duplicate values, this will fail.
  - Made the column `opaqueKey` on table `PoeCharacter` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PoeCharacter" ALTER COLUMN "opaqueKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PoeCharacter_opaqueKey_key" ON "PoeCharacter"("opaqueKey");

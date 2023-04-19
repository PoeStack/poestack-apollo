/*
  Warnings:

  - A unique constraint covering the columns `[opaqueKey]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "opaqueKey" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_opaqueKey_key" ON "UserProfile"("opaqueKey");

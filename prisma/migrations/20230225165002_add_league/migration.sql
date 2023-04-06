/*
  Warnings:

  - You are about to drop the `PoeAccountActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PoeAccountActivity";

-- CreateTable
CREATE TABLE "PoeProfileActivity" (
    "poeProfileName" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoeProfileActivity_pkey" PRIMARY KEY ("poeProfileName","league")
);

-- CreateIndex
CREATE INDEX "PoeProfileActivity_poeProfileName_league_idx" ON "PoeProfileActivity"("poeProfileName", "league");

-- CreateIndex
CREATE INDEX "PoeProfileActivity_createdAtTimestamp_idx" ON "PoeProfileActivity"("createdAtTimestamp");

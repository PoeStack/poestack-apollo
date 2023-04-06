/*
  Warnings:

  - You are about to drop the `LeagueActivitySnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PoeProfileActivity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LeagueActivitySnapshot";

-- DropTable
DROP TABLE "PoeProfileActivity";

-- CreateTable
CREATE TABLE "PoeLeagueActivitySnapshot" (
    "league" TEXT NOT NULL,
    "lookbackWindowHours" INTEGER NOT NULL DEFAULT 6,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "players" INTEGER NOT NULL,

    CONSTRAINT "PoeLeagueActivitySnapshot_pkey" PRIMARY KEY ("league","timestamp","lookbackWindowHours")
);

-- CreateIndex
CREATE INDEX "PoeLeagueActivitySnapshot_league_timestamp_idx" ON "PoeLeagueActivitySnapshot"("league", "timestamp");

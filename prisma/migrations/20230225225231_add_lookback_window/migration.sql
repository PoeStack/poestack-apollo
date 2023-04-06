/*
  Warnings:

  - The primary key for the `LeagueActivitySnapshot` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "LeagueActivitySnapshot" DROP CONSTRAINT "LeagueActivitySnapshot_pkey",
ADD COLUMN     "rollingWindowHours" INTEGER NOT NULL DEFAULT 6,
ADD CONSTRAINT "LeagueActivitySnapshot_pkey" PRIMARY KEY ("league", "timestamp", "rollingWindowHours");

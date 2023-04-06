-- CreateTable
CREATE TABLE "LeagueActivitySnapshot" (
    "league" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "players" INTEGER NOT NULL,

    CONSTRAINT "LeagueActivitySnapshot_pkey" PRIMARY KEY ("league","timestamp")
);

-- CreateIndex
CREATE INDEX "LeagueActivitySnapshot_league_timestamp_idx" ON "LeagueActivitySnapshot"("league", "timestamp");

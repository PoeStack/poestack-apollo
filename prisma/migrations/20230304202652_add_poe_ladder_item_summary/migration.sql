-- CreateTable
CREATE TABLE "PoeLadderItemSummary" (
    "id" SERIAL NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "league" TEXT NOT NULL,
    "poeCharacterName" TEXT NOT NULL,
    "baseType" TEXT NOT NULL,
    "explicit0Type" TEXT NOT NULL,
    "explicit1Type" TEXT NOT NULL,
    "explicit2Type" TEXT NOT NULL,
    "explicit3Type" TEXT NOT NULL,
    "explicit4Type" TEXT NOT NULL,
    "explicit5Type" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "PoeLadderItemSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoeLadderItemSummary_league_idx" ON "PoeLadderItemSummary"("league");

-- CreateIndex
CREATE INDEX "PoeLadderItemSummary_poeCharacterName_idx" ON "PoeLadderItemSummary"("poeCharacterName");

-- CreateIndex
CREATE INDEX "PoeLadderItemSummary_label_idx" ON "PoeLadderItemSummary"("label");

-- CreateIndex
CREATE INDEX "PoeLadderItemSummary_createdAtTimestamp_idx" ON "PoeLadderItemSummary"("createdAtTimestamp");

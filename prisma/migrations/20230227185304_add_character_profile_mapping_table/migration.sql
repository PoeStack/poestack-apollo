-- CreateTable
CREATE TABLE "PoeProfileToCharacterMapping" (
    "poeProfileName" TEXT NOT NULL,
    "lastPoeCharacterName" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoeProfileToCharacterMapping_pkey" PRIMARY KEY ("poeProfileName","lastPoeCharacterName")
);

-- CreateIndex
CREATE INDEX "PoeProfileToCharacterMapping_poeProfileName_idx" ON "PoeProfileToCharacterMapping"("poeProfileName");

-- CreateIndex
CREATE INDEX "PoeProfileToCharacterMapping_lastPoeCharacterName_idx" ON "PoeProfileToCharacterMapping"("lastPoeCharacterName");

-- CreateIndex
CREATE INDEX "PoeProfileToCharacterMapping_updatedAtTimestamp_idx" ON "PoeProfileToCharacterMapping"("updatedAtTimestamp");

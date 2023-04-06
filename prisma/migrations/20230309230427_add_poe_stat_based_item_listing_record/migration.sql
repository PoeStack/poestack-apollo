-- CreateTable
CREATE TABLE "PoeStatBasedItemListingRecord" (
    "id" SERIAL NOT NULL,
    "publicStashId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "noteValue" DOUBLE PRECISION NOT NULL,
    "tags" TEXT[],
    "baseType" TEXT NOT NULL,
    "frameType" INTEGER NOT NULL,
    "corrupted" BOOLEAN NOT NULL,
    "itemLevel" INTEGER NOT NULL,
    "sixLink" BOOLEAN NOT NULL,
    "implicitMods" TEXT[],
    "cosmeticMods" TEXT[],
    "craftedMods" TEXT[],
    "enchantMods" TEXT[],
    "explicitMods" TEXT[],
    "fracturedMods" TEXT[],

    CONSTRAINT "PoeStatBasedItemListingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoeStatBasedItemListingRecord_publicStashId_idx" ON "PoeStatBasedItemListingRecord"("publicStashId");

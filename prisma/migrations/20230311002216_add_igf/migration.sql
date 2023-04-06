-- CreateTable
CREATE TABLE "ItemGroupInfo" (
    "hashString" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "baseType" TEXT,
    "icon" TEXT,
    "inventoryMaxStackSize" INTEGER,
    "displayName" TEXT,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemGroupInfo_pkey" PRIMARY KEY ("hashString")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemGroupInfo_hashString_key" ON "ItemGroupInfo"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupInfo_key_idx" ON "ItemGroupInfo"("key");

-- CreateIndex
CREATE INDEX "ItemGroupInfo_tag_idx" ON "ItemGroupInfo"("tag");

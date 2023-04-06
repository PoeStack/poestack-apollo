-- CreateTable
CREATE TABLE "ItemGroup" (
    "hashString" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "baseType" TEXT,
    "icon" TEXT,
    "inventoryMaxStackSize" INTEGER,
    "displayName" TEXT,

    CONSTRAINT "ItemGroup_pkey" PRIMARY KEY ("hashString")
);

-- CreateTable
CREATE TABLE "ItemGroupPValue" (
    "hashString" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stockRangeStartInclusive" INTEGER NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemGroupPValue_pkey" PRIMARY KEY ("hashString","type","stockRangeStartInclusive")
);

-- CreateTable
CREATE TABLE "ItemGroupPValueHourlyTimeseriesEntry" (
    "hashString" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stockRangeStartInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_pkey" PRIMARY KEY ("hashString","type","stockRangeStartInclusive","timestamp")
);

-- CreateTable
CREATE TABLE "PublicStashListing" (
    "id" SERIAL NOT NULL,
    "publicStashId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "listedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "itemGroupHashKey" TEXT NOT NULL,
    "itemGroupHashString" TEXT NOT NULL,
    "stackSize" INTEGER NOT NULL,
    "listedValueChaos" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PublicStashListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "poeProfileName" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastConnectedTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oAuthToken" TEXT NOT NULL,
    "oAuthTokenUpdatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PoeStashTab" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "parent" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "flatIndex" INTEGER,

    CONSTRAINT "PoeStashTab_pkey" PRIMARY KEY ("userId","id","league")
);

-- CreateTable
CREATE TABLE "StashSnapshotProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL,
    "poeStashTabIds" TEXT[],
    "valuationTargetPValue" TEXT NOT NULL,
    "valuationStockInfluence" TEXT NOT NULL,

    CONSTRAINT "StashSnapshotProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashSnapshot" (
    "id" SERIAL NOT NULL,
    "league" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotProfileId" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "totalValueChaos" DOUBLE PRECISION NOT NULL,
    "divineChaosValue" DOUBLE PRECISION NOT NULL,
    "exaltChaosValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StashSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashSnapshotItemGroupSummary" (
    "userId" TEXT NOT NULL,
    "stashSnapshotId" INTEGER NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemGroupHashString" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "valueChaos" DOUBLE PRECISION NOT NULL,
    "totalValueChaos" DOUBLE PRECISION NOT NULL,
    "stashLocations" JSONB[],
    "stashSnapshotExportId" TEXT,

    CONSTRAINT "StashSnapshotItemGroupSummary_pkey" PRIMARY KEY ("itemGroupHashString","stashSnapshotId")
);

-- CreateTable
CREATE TABLE "StashSnapshotExport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exportRaw" TEXT NOT NULL,
    "totalValueChaos" DOUBLE PRECISION NOT NULL,
    "itemGroupSummaries" JSONB[],
    "divineChaosValue" DOUBLE PRECISION NOT NULL,
    "input" JSONB NOT NULL,

    CONSTRAINT "StashSnapshotExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicStashListing_itemGroupHashString_idx" ON "PublicStashListing"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "PublicStashListing_publicStashId_idx" ON "PublicStashListing"("publicStashId");

-- AddForeignKey
ALTER TABLE "ItemGroupPValue" ADD CONSTRAINT "ItemGroupPValue_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemGroupPValueHourlyTimeseriesEntry" ADD CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_hashString_fkey" FOREIGN KEY ("hashString") REFERENCES "ItemGroup"("hashString") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoeStashTab" ADD CONSTRAINT "PoeStashTab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StashSnapshotItemGroupSummary" ADD CONSTRAINT "StashSnapshotItemGroupSummary_itemGroupHashString_fkey" FOREIGN KEY ("itemGroupHashString") REFERENCES "ItemGroup"("hashString") ON DELETE CASCADE ON UPDATE CASCADE;

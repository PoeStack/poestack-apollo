-- CreateTable
CREATE TABLE "ItemGroupInfo" (
    "hashString" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "hashFields" JSONB NOT NULL DEFAULT '{}',
    "baseType" TEXT,
    "icon" TEXT,
    "inventoryMaxStackSize" INTEGER,
    "displayName" TEXT,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemGroupInfo_pkey" PRIMARY KEY ("hashString")
);

-- CreateTable
CREATE TABLE "ItemGroupPValue" (
    "hashString" TEXT NOT NULL,
    "league" TEXT NOT NULL DEFAULT 'NA',
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stockRangeStartInclusive" INTEGER NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "lookbackWindowUsedHours" INTEGER NOT NULL DEFAULT 48,

    CONSTRAINT "ItemGroupPValue_pkey" PRIMARY KEY ("hashString","type","stockRangeStartInclusive","league")
);

-- CreateTable
CREATE TABLE "ItemGroupPValueHourlyTimeseriesEntry" (
    "hashString" TEXT NOT NULL,
    "league" TEXT NOT NULL DEFAULT 'NA',
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stockRangeStartInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemGroupPValueHourlyTimeseriesEntry_pkey" PRIMARY KEY ("hashString","type","stockRangeStartInclusive","timestamp","league")
);

-- CreateTable
CREATE TABLE "ItemGroupPValueDailyTimeseriesEntry" (
    "hashString" TEXT NOT NULL,
    "league" TEXT NOT NULL DEFAULT 'NA',
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stockRangeStartInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemGroupPValueDailyTimeseriesEntry_pkey" PRIMARY KEY ("hashString","type","stockRangeStartInclusive","timestamp","league")
);

-- CreateTable
CREATE TABLE "PoeLiveListing" (
    "publicStashId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "poeProfileName" TEXT NOT NULL,
    "listedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "itemGroupHashString" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "listedValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoeLiveListing_pkey" PRIMARY KEY ("publicStashId","itemGroupHashString")
);

-- CreateTable
CREATE TABLE "PoeLiveProfileActivityRecord" (
    "poeProfileName" TEXT NOT NULL,
    "lastActiveTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoeLiveProfileActivityRecord_pkey" PRIMARY KEY ("poeProfileName")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "opaqueKey" TEXT NOT NULL,
    "poeProfileName" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastConnectedTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oAuthToken" TEXT,
    "oAuthTokenUpdatedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "discordUserId" TEXT,
    "discordUsername" TEXT,
    "discordUserIdUpdatedAtTimestamp" TIMESTAMP(3),
    "tftMember" BOOLEAN,
    "tftMemberUpdatedAtTimestamp" TIMESTAMP(3),
    "patreonUserId" TEXT,
    "patreonTier" TEXT,
    "patreonUpdatedAtTimestamp" TIMESTAMP(3),
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "TwitchStreamerProfile" (
    "userId" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "lastVideoTimestamp" TIMESTAMP(3) NOT NULL,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitchStreamerProfile_pkey" PRIMARY KEY ("userId")
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
CREATE TABLE "GenericParam" (
    "key" TEXT NOT NULL,
    "valueString" TEXT NOT NULL,

    CONSTRAINT "GenericParam_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PoeCharacter" (
    "id" TEXT NOT NULL,
    "opaqueKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "lastLeague" TEXT,
    "lastLevel" INTEGER NOT NULL DEFAULT 0,
    "lastLevelChangeTimestamp" TIMESTAMP(3),
    "ladderViewNextSnapshotTimestamp" TIMESTAMP(3),
    "lastSnapshotTimestamp" TIMESTAMP(3),
    "lastSnapshotHash" TEXT,
    "lastSnapshotHashUpdateTimestamp" TIMESTAMP(3),

    CONSTRAINT "PoeCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSnapshotRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "experience" BIGINT NOT NULL,
    "level" INTEGER NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "CharacterSnapshotRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtlasPassiveTreeSnapshot" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "systemSnapshotTimestamp" TIMESTAMP(3) NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "hashes" INTEGER[],
    "source" TEXT NOT NULL,

    CONSTRAINT "AtlasPassiveTreeSnapshot_pkey" PRIMARY KEY ("userId","league","systemSnapshotTimestamp")
);

-- CreateTable
CREATE TABLE "CharacterSnapshotSearchableSummary2" (
    "userId" TEXT,
    "poeProfileName" TEXT,
    "snapshotId" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "systemSnapshotTimestamp" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'user',
    "league" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "characterClass" TEXT NOT NULL,
    "mainSkillKey" TEXT,
    "passiveNodeKeys" TEXT[],
    "itemKeys" TEXT[],
    "life" INTEGER,
    "name" TEXT,
    "energyShield" INTEGER,
    "level" INTEGER,
    "twitchProfileName" TEXT,
    "pobDps" INTEGER,
    "totalValueChaos" INTEGER,
    "totalValueDivine" DOUBLE PRECISION,
    "topItems" JSONB[],

    CONSTRAINT "CharacterSnapshotSearchableSummary2_pkey" PRIMARY KEY ("characterId")
);

-- CreateTable
CREATE TABLE "CustomLadderGroup" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAtTimestamp" TIMESTAMP(3) NOT NULL,
    "members" JSONB[],

    CONSTRAINT "CustomLadderGroup_pkey" PRIMARY KEY ("id","ownerUserId")
);

-- CreateTable
CREATE TABLE "DiscordServiceMessageRecord" (
    "messageId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "senderDiscordId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "properties" JSONB NOT NULL,

    CONSTRAINT "DiscordServiceMessageRecord_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "OneClickMessageHistory" (
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "exportType" TEXT NOT NULL,
    "exportSubType" TEXT,
    "rateLimitExpires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneClickMessageHistory_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "StashViewSnapshotJob" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rateLimitEndTimestamp" TIMESTAMP(3),

    CONSTRAINT "StashViewSnapshotJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashViewValueSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "stashId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "lpValue" DOUBLE PRECISION,
    "lpStockValue" DOUBLE PRECISION,
    "fixedValue" DOUBLE PRECISION,

    CONSTRAINT "StashViewValueSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StashViewSnapshotRecord" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "favorited" BOOLEAN NOT NULL,
    "name" TEXT,
    "lpValue" DOUBLE PRECISION,
    "lpStockValue" DOUBLE PRECISION,
    "fixedValue" DOUBLE PRECISION,

    CONSTRAINT "StashViewSnapshotRecord_pkey" PRIMARY KEY ("userId","league","timestamp")
);

-- CreateTable
CREATE TABLE "StashViewAutomaticSnapshotSettings" (
    "userId" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "stashIds" TEXT[],
    "durationBetweenSnapshotsSeconds" INTEGER NOT NULL,
    "nextSnapshotTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StashViewAutomaticSnapshotSettings_pkey" PRIMARY KEY ("userId","league")
);

-- CreateTable
CREATE TABLE "TftLiveListing" (
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userDiscordId" TEXT NOT NULL,
    "userDiscordName" TEXT NOT NULL,
    "userDiscordDisplayRole" TEXT,
    "userDiscordDisplayRoleColor" TEXT,
    "userDiscordHighestRole" TEXT,
    "updatedAtTimestamp" TIMESTAMP(3) NOT NULL,
    "tag" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "body" TEXT NOT NULL,
    "delistedAtTimestamp" TIMESTAMP(3),

    CONSTRAINT "TftLiveListing_pkey" PRIMARY KEY ("userDiscordId","channelId")
);

-- CreateTable
CREATE TABLE "LivePricingHistoryHourEntry" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minQuantityInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivePricingHistoryHourEntry_pkey" PRIMARY KEY ("itemGroupHashString","league","type","minQuantityInclusive","timestamp")
);

-- CreateTable
CREATE TABLE "LivePricingHistoryDayEntry" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minQuantityInclusive" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivePricingHistoryDayEntry_pkey" PRIMARY KEY ("itemGroupHashString","league","type","minQuantityInclusive","timestamp")
);

-- CreateTable
CREATE TABLE "LivePricingHistoryFixedLastEntry" (
    "itemGroupHashString" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "totalListings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LivePricingHistoryFixedLastEntry_pkey" PRIMARY KEY ("itemGroupHashString","league")
);

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "href" TEXT,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LadderViewSnapshotRecord" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "snapshotHashString" TEXT NOT NULL,
    "lastestSnapshot" BOOLEAN NOT NULL,
    "snapshotStatus" TEXT NOT NULL,
    "pobShardKey" INTEGER NOT NULL,

    CONSTRAINT "LadderViewSnapshotRecord_pkey" PRIMARY KEY ("userId","characterId","timestamp")
);

-- CreateTable
CREATE TABLE "LadderViewSnapshotVectorSummary" (
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "characterApiFields" JSONB NOT NULL,
    "characterPobFields" JSONB NOT NULL,

    CONSTRAINT "LadderViewSnapshotVectorSummary_pkey" PRIMARY KEY ("userId","characterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemGroupInfo_hashString_key" ON "ItemGroupInfo"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupInfo_key_idx" ON "ItemGroupInfo"("key");

-- CreateIndex
CREATE INDEX "ItemGroupInfo_tag_idx" ON "ItemGroupInfo"("tag");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_hashString_idx" ON "ItemGroupPValue"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_updatedAtTimestamp_idx" ON "ItemGroupPValue"("updatedAtTimestamp");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_type_idx" ON "ItemGroupPValue"("type");

-- CreateIndex
CREATE INDEX "ItemGroupPValue_stockRangeStartInclusive_idx" ON "ItemGroupPValue"("stockRangeStartInclusive");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_hashString_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_timestamp_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("timestamp");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_type_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("type");

-- CreateIndex
CREATE INDEX "ItemGroupPValueHourlyTimeseriesEntry_stockRangeStartInclusi_idx" ON "ItemGroupPValueHourlyTimeseriesEntry"("stockRangeStartInclusive");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_hashString_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("hashString");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_timestamp_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("timestamp");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_type_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("type");

-- CreateIndex
CREATE INDEX "ItemGroupPValueDailyTimeseriesEntry_stockRangeStartInclusiv_idx" ON "ItemGroupPValueDailyTimeseriesEntry"("stockRangeStartInclusive");

-- CreateIndex
CREATE INDEX "PoeLiveListing_league_idx" ON "PoeLiveListing"("league");

-- CreateIndex
CREATE INDEX "PoeLiveListing_itemGroupHashString_idx" ON "PoeLiveListing"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "PoeLiveListing_publicStashId_idx" ON "PoeLiveListing"("publicStashId");

-- CreateIndex
CREATE INDEX "PoeLiveListing_listedAtTimestamp_idx" ON "PoeLiveListing"("listedAtTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_opaqueKey_key" ON "UserProfile"("opaqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchStreamerProfile_userId_key" ON "TwitchStreamerProfile"("userId");

-- CreateIndex
CREATE INDEX "PoeCharacter_opaqueKey_idx" ON "PoeCharacter"("opaqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "PoeCharacter_opaqueKey_key" ON "PoeCharacter"("opaqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotRecord_id_key" ON "CharacterSnapshotRecord"("id");

-- CreateIndex
CREATE INDEX "AtlasPassiveTreeSnapshot_userId_systemSnapshotTimestamp_idx" ON "AtlasPassiveTreeSnapshot"("userId", "systemSnapshotTimestamp");

-- CreateIndex
CREATE INDEX "AtlasPassiveTreeSnapshot_league_idx" ON "AtlasPassiveTreeSnapshot"("league");

-- CreateIndex
CREATE INDEX "AtlasPassiveTreeSnapshot_source_idx" ON "AtlasPassiveTreeSnapshot"("source");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary2_snapshotId_key" ON "CharacterSnapshotSearchableSummary2"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSnapshotSearchableSummary2_characterId_key" ON "CharacterSnapshotSearchableSummary2"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_characterId_idx" ON "CharacterSnapshotSearchableSummary2"("characterId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_createdAtTimestamp_idx" ON "CharacterSnapshotSearchableSummary2"("createdAtTimestamp");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_mainSkillKey_idx" ON "CharacterSnapshotSearchableSummary2"("mainSkillKey");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_userId_idx" ON "CharacterSnapshotSearchableSummary2"("userId");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_league_idx" ON "CharacterSnapshotSearchableSummary2"("league");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_characterClass_idx" ON "CharacterSnapshotSearchableSummary2"("characterClass");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_passiveNodeKeys_idx" ON "CharacterSnapshotSearchableSummary2"("passiveNodeKeys");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_itemKeys_idx" ON "CharacterSnapshotSearchableSummary2"("itemKeys");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_systemSnapshotTimestamp_idx" ON "CharacterSnapshotSearchableSummary2"("systemSnapshotTimestamp");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_source_idx" ON "CharacterSnapshotSearchableSummary2"("source");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_totalValueChaos_idx" ON "CharacterSnapshotSearchableSummary2"("totalValueChaos");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_totalValueDivine_idx" ON "CharacterSnapshotSearchableSummary2"("totalValueDivine");

-- CreateIndex
CREATE INDEX "CharacterSnapshotSearchableSummary2_pobDps_idx" ON "CharacterSnapshotSearchableSummary2"("pobDps");

-- CreateIndex
CREATE INDEX "OneClickMessageHistory_userId_idx" ON "OneClickMessageHistory"("userId");

-- CreateIndex
CREATE INDEX "StashViewSnapshotJob_userId_idx" ON "StashViewSnapshotJob"("userId");

-- CreateIndex
CREATE INDEX "StashViewValueSnapshot_userId_idx" ON "StashViewValueSnapshot"("userId");

-- CreateIndex
CREATE INDEX "StashViewSnapshotRecord_userId_idx" ON "StashViewSnapshotRecord"("userId");

-- CreateIndex
CREATE INDEX "LivePricingHistoryHourEntry_itemGroupHashString_idx" ON "LivePricingHistoryHourEntry"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "LivePricingHistoryHourEntry_timestamp_idx" ON "LivePricingHistoryHourEntry"("timestamp");

-- CreateIndex
CREATE INDEX "LivePricingHistoryDayEntry_itemGroupHashString_idx" ON "LivePricingHistoryDayEntry"("itemGroupHashString");

-- CreateIndex
CREATE INDEX "LivePricingHistoryDayEntry_timestamp_idx" ON "LivePricingHistoryDayEntry"("timestamp");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_userId_idx" ON "LadderViewSnapshotRecord"("userId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotRecord_characterId_idx" ON "LadderViewSnapshotRecord"("characterId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotVectorSummary_userId_idx" ON "LadderViewSnapshotVectorSummary"("userId");

-- CreateIndex
CREATE INDEX "LadderViewSnapshotVectorSummary_characterId_idx" ON "LadderViewSnapshotVectorSummary"("characterId");

-- AddForeignKey
ALTER TABLE "TwitchStreamerProfile" ADD CONSTRAINT "TwitchStreamerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoeStashTab" ADD CONSTRAINT "PoeStashTab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoeCharacter" ADD CONSTRAINT "PoeCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSnapshotRecord" ADD CONSTRAINT "CharacterSnapshotRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtlasPassiveTreeSnapshot" ADD CONSTRAINT "AtlasPassiveTreeSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSnapshotSearchableSummary2" ADD CONSTRAINT "CharacterSnapshotSearchableSummary2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomLadderGroup" ADD CONSTRAINT "CustomLadderGroup_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;


import { PoeApiStashTab } from "@gql/resolvers-types";
import { GraphQLBigInt, GraphQLJSON, GraphQLJSONObject } from "graphql-scalars";
import { Field, InputType, Int, ObjectType } from "type-graphql";

@InputType("StashSnapshotItemGroupSummarySearchInput")
@ObjectType("StashSnapshotItemGroupSummarySearch")
export class GqlStashSnapshotItemGroupSummarySearch {
  @Field({ nullable: true })
  snapshotId: string;

  @Field({ nullable: true })
  skip?: number;

  @Field({ nullable: true })
  limit?: number;

  @Field({ nullable: true })
  searchstring?: string;

  @Field({ nullable: true })
  sortKey?: string;

  @Field({ nullable: true })
  sortDirection?: string;

  @Field({ nullable: true })
  minTotalValueChaos?: number;

  @Field({ nullable: true })
  minValueChaos?: number;

  @Field(() => [String], { nullable: true })
  excludedItemGroupHashStrings?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  keys?: string[];
}

@ObjectType("StashSnapshotExportItemValueOverride")
@InputType("StashSnapshotExportItemValueOverrideInput")
export class GqlStashSnapshotExportItemValueOverride {
  @Field()
  itemGroupHashString: string;

  @Field()
  valueChaos: number;
}

@InputType("StashSnapshotExportInput")
@ObjectType("StashSnapshotExportInputObject")
export class GqlStashSnapshotExportInput {
  @Field()
  league: string;

  @Field()
  exportType: string;

  @Field({ nullable: true })
  exportSubType?: string;

  @Field()
  ign: string;

  @Field()
  listedValueMultiplier: number;

  @Field()
  search: GqlStashSnapshotItemGroupSummarySearch;

  @Field()
  alwaysPriceInChaos: boolean;

  @Field()
  visualDecimalPrecision: number;

  @Field()
  maxStackSizeSetting: string;

  @Field()
  absoluteMinValueChaos: number;

  @Field()
  stashIndexOffset: number;

  @Field(() => [GqlStashSnapshotExportItemValueOverride])
  itemGroupValueOverrides: GqlStashSnapshotExportItemValueOverride[];

  @Field()
  oneClickPost: boolean;
}

@ObjectType("StashSnapshotExport")
export class GqlStashSnapshotExport {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  createdAtTimestamp: Date;

  @Field()
  exportRaw: string;

  @Field()
  totalValueChaos: number;

  @Field(() => [GqlStashSnapshotItemGroupSummary])
  itemGroupSummaries: GqlStashSnapshotItemGroupSummary[];

  @Field()
  divineChaosValue: number;

  @Field()
  input: GqlStashSnapshotExportInput;
}

@ObjectType("ItemGroup")
export class GqlItemGroup {
  @Field()
  hashString: string;

  @Field()
  key: string;

  @Field()
  tag: string;

  @Field(() => [GraphQLJSONObject], { nullable: true })
  properties: GqlItemGroupHashProperty[];

  @Field({ nullable: true })
  baseType: string;

  @Field({ nullable: true })
  icon: string;

  @Field({ nullable: true })
  inventoryMaxStackSize: number;

  @Field({ nullable: true })
  displayName: string;

  @Field()
  createdAtTimestamp: Date;
}

@ObjectType("SearchableItemGroupSummary")
export class GqlSearchableItemGroupSummary {
  @Field()
  key: string;

  @Field()
  tag: string;

  @Field({ nullable: true })
  icon: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field()
  value: number;
}

@ObjectType("ItemGroupHashProperty")
export class GqlItemGroupHashProperty {
  @Field()
  key: string;

  @Field()
  value: number;
}

@ObjectType("ItemGroupPValue")
export class GqlItemGroupPValue {
  @Field()
  hashString: string;

  @Field()
  type: string;

  @Field()
  value: number;

  @Field()
  stockRangeStartInclusive: number;

  @Field()
  updatedAtTimestamp: Date;

  @Field({ nullable: true })
  itemGroup: GqlItemGroup;
}

@ObjectType("ItemGroupPValueHourlyTimeseriesEntry")
export class GqlItemGroupPValueHourlyTimeseriesEntry {
  @Field()
  hashString: string;

  @Field()
  type: string;

  @Field()
  value: number;

  @Field()
  stockRangeStartInclusive: number;

  @Field()
  timestamp: Date;

  @Field({ nullable: true })
  itemGroup: GqlItemGroup;
}

@ObjectType("UserProfile")
export class GqlUserProfile {
  @Field()
  userId: string;

  @Field()
  poeProfileName: string;

  @Field({ nullable: true })
  createdAtTimestamp?: Date;

  @Field({ nullable: true })
  lastConnectedTimestamp?: Date;

  @Field({ nullable: true })
  oAuthTokenUpdatedAtTimestamp?: Date;

  @Field({ nullable: true })
  discordUserId: string;

  @Field({ nullable: true })
  discordUsername: string;

  @Field({ nullable: true })
  patreonUserId: string;

  @Field({ nullable: true })
  patreonTier: string;

  @Field({ nullable: true })
  opaqueKey: string;

  @Field(() => [String])
  roles: string;

  oAuthToken: string;
}

@ObjectType("PoeStashTab")
export class GqlPoeStashTab {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  league: string;

  @Field({ nullable: true })
  parent: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  index: number;

  @Field({ nullable: true })
  flatIndex: number;
}

@ObjectType("StashSnapshotProfile")
export class GqlStashSnapshotProfile {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  league: string;

  @Field()
  name: string;

  @Field()
  public: boolean;

  @Field()
  createdAtTimestamp: Date;

  @Field(() => [String])
  poeStashTabIds: string[];

  @Field()
  valuationTargetPValue: string;

  @Field()
  valuationStockInfluence: string;

  @Field({ nullable: true })
  automaticSnapshotIntervalSeconds?: number;
}

@InputType("DetachedStashSnapshotInput")
export class GqlDetachedStashSnapshotInput {
  @Field()
  userId: string;

  @Field()
  league: string;

  @Field(() => [String])
  poeStashTabIds: string[];

  @Field()
  valuationTargetPValue: string;

  @Field()
  valuationStockInfluence: string;
}

@InputType("StashSnapshotProfileInput")
export class GqlStashSnapshotProfileInput {
  @Field()
  id: string;

  @Field()
  league: string;

  @Field()
  name: string;

  @Field()
  public: boolean;

  @Field(() => [String])
  poeStashTabIds: string[];

  @Field()
  valuationTargetPValue: string;

  @Field()
  valuationStockInfluence: string;

  @Field({ nullable: true })
  automaticSnapshotIntervalSeconds?: number;
}

@ObjectType("StashSnapshot")
export class GqlStashSnapshot {
  @Field()
  id: string;

  @Field()
  league: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  snapshotProfileId?: string;

  @Field()
  createdAtTimestamp: Date;

  @Field(() => [String])
  tags: string[];

  @Field()
  totalValueChaos: number;

  @Field()
  divineChaosValue: number;

  @Field()
  exaltChaosValue: number;
}

@ObjectType("StashSnapshotItemGroupSummary")
export class GqlStashSnapshotItemGroupSummary {
  @Field()
  userId: string;

  @Field()
  stashSnapshotId: string;

  @Field()
  createdAtTimestamp: Date;

  @Field()
  itemGroupHashString: string;

  @Field()
  league: string;

  @Field()
  quantity: number;

  @Field()
  valueChaos: number;

  @Field()
  totalValueChaos: number;

  @Field(() => [GqlStashLocation])
  stashLocations: GqlStashLocation[];

  @Field({ nullable: true })
  itemGroup?: GqlItemGroup;

  @Field({ nullable: true })
  stashSnapshot?: GqlStashSnapshot;
}

@ObjectType("StashLocation")
export class GqlStashLocation {
  @Field()
  tabId: string;

  @Field()
  name: string;

  @Field()
  index: number;

  @Field()
  flatIndex: number;

  @Field()
  x: number;

  @Field()
  y: number;

  @Field({ nullable: true })
  quantity: number;
}

@ObjectType("StashSnapshotItemGroupSummarySearchResponse")
export class GqlStashSnapshotItemGroupSummarySearchResponse {
  @Field()
  hasMore: boolean;

  @Field(() => [GqlStashSnapshotItemGroupSummary])
  itemGroupSummaries: GqlStashSnapshotItemGroupSummary[];

  @Field()
  totalValueChaos: number;
}

@ObjectType("StashSnapshotItemGroupSummarySearchAggregationResponse")
export class GqlStashSnapshotItemGroupSummarySearchAggregationResponse {
  @Field(() => [GqlStashSnapshotItemGroupSearchSummaryAggregationEntry])
  entries: GqlStashSnapshotItemGroupSearchSummaryAggregationEntry[];
}

@ObjectType("StashSnapshotItemGroupSearchSummaryAggregationEntry")
export class GqlStashSnapshotItemGroupSearchSummaryAggregationEntry {
  @Field()
  key: string;

  @Field()
  value: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  matches?: bigint;
}

@InputType("ItemGroupSearchInput")
@ObjectType("ItemGroupSearch")
export class GqlItemGroupSearch {
  @Field(() => [String], { nullable: true })
  itemGroupHashKeys?: string[];

  @Field(() => [String], { nullable: true })
  itemGroupHashStrings?: [string];

  @Field(() => [String], { nullable: true })
  itemGroupHashTags?: string[];

  @Field()
  league: string;

  @Field({ nullable: true })
  skip?: number;

  @Field({ nullable: true })
  limit?: number;

  @Field({ nullable: true })
  searchString?: string;

  @Field({ nullable: true })
  sortDirection?: number;
}

@InputType("ItemGroupValueTimeseriesSearchInput")
@ObjectType("ItemGroupValueTimeseriesSearch")
export class GqlItemGroupValueTimeseriesSearch {
  @Field({ nullable: true })
  bucketType?: string;

  @Field(() => [String])
  seriesTypes: string[];

  @Field(() => [Int])
  stockStartingRanges: [number];

  @Field(() => GqlItemGroupSearch)
  itemGroupSearch: GqlItemGroupSearch;
}

@ObjectType("ItemGroupValueTimeseriesGroupEntry")
export class GqlItemGroupValueTimeseriesGroupEntry {
  @Field()
  timestamp: Date;

  @Field()
  value: number;
}

@ObjectType("ItemGroupValueTimeseriesGroupSeries")
export class GqlItemGroupValueTimeseriesGroupSeries {
  @Field()
  type: string;

  @Field()
  stockRangeStartInclusive: number;

  @Field(() => [GqlItemGroupValueTimeseriesGroupEntry])
  entries: GqlItemGroupValueTimeseriesGroupEntry[];
}

@ObjectType("ItemGroupValueTimeseries")
export class GqlItemGroupValueTimeseries {
  @Field(() => GqlItemGroup)
  itemGroup: GqlItemGroup;

  @Field(() => [GqlItemGroupValueTimeseriesGroupSeries])
  series: GqlItemGroupValueTimeseriesGroupSeries[];
}

@ObjectType("ItemGroupValueTimeseriesResult")
export class GqlItemGroupValueTimeseriesResult {
  @Field(() => [GqlItemGroupValueTimeseries])
  results: GqlItemGroupValueTimeseries[];
}

@InputType("GlobalSearch")
export class GqlGlobalSearch {
  @Field()
  league: string;

  @Field()
  searchText: string;
}

@ObjectType("GlobalSearchResponse")
export class GqlGlobalSearchResponse {
  @Field(() => [GqlGlobalSearchResponseEntry])
  results: GqlGlobalSearchResponseEntry[];
}

@ObjectType("GlobalSearchResponseEntry")
export class GqlGlobalSearchResponseEntry {
  @Field()
  group: string;

  @Field()
  display: string;

  @Field()
  target: string;

  @Field({ nullable: true })
  icon: string;
}

@ObjectType("PoeCharacter")
export class GqlPoeCharacter {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field()
  lastLeague: string;

  @Field()
  createdAtTimestamp: Date;

  @Field({ nullable: true })
  lastSnapshotTimestamp?: Date;
}

@ObjectType("CharacterSnapshotItem")
export class GqlCharacterSnapshotItem {
  @Field({ nullable: true })
  itemId?: string;

  @Field({ nullable: true })
  inventoryId?: string;

  @Field({ nullable: true })
  socketedInId?: string;

  @Field({ nullable: true })
  baseType?: string;

  @Field({ nullable: true })
  typeLine?: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  ilvl: number;

  @Field(() => [String], { nullable: true })
  explicitMods: string[];

  @Field(() => [String], { nullable: true })
  enchantMods: string[];

  @Field(() => [String], { nullable: true })
  implicitMods: string[];

  @Field(() => [String], { nullable: true })
  utilityMods: string[];

  @Field(() => [String], { nullable: true })
  fracturedMods: string[];

  @Field(() => [String], { nullable: true })
  craftedMods: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  influences?: any;

  @Field(() => [GraphQLJSON])
  properties: any[];

  @Field(() => [GraphQLJSON])
  requirements: any[];

  @Field(() => [GraphQLJSON])
  sockets: any[];

  @Field(() => GraphQLJSON, { nullable: true })
  crucible: any;

  @Field()
  frameType: number;

  @Field(() => [String])
  flavourText: string[];

  @Field({ nullable: true })
  description?: string;

  @Field()
  icon: string;

  @Field()
  w: number;

  @Field()
  h: number;

  @Field({ nullable: true })
  corrupted?: boolean;

  @Field({ nullable: true })
  support?: boolean;

  @Field({ nullable: true })
  socket?: number;

  @Field({ nullable: true })
  gemColor?: string;

  @Field({ nullable: true })
  mainSkill?: boolean;

  @Field({ nullable: true })
  itemGroupHashString?: string;

  @Field({ nullable: true })
  valueChaos?: number;
}

@ObjectType("CharacterPassivesSnapshot")
export class GqlCharacterPassivesSnapshot {
  @Field({ nullable: true })
  banditChoice?: string;

  @Field({ nullable: true })
  pantheonMajor?: string;

  @Field({ nullable: true })
  pantheonMinor?: string;

  @Field(() => [Number])
  hashes: number[];

  @Field(() => [Number])
  hashesEx: number[];

  @Field(() => GraphQLJSON)
  jewelData: any;

  @Field(() => GraphQLJSON)
  masteryEffects: any;
}

@ObjectType("CharacterSnapshotPobStats")
export class GqlCharacterSnapshotPobStats {
  @Field({ nullable: true })
  accuracy?: number;

  @Field({ nullable: true })
  armour?: number;

  @Field({ nullable: true })
  blockChance?: number;

  @Field({ nullable: true })
  spellBlockChance?: number;

  @Field({ nullable: true })
  chaosResist?: number;

  @Field({ nullable: true })
  coldResist?: number;

  @Field({ nullable: true })
  dex?: number;

  @Field({ nullable: true })
  energyShield?: number;

  @Field({ nullable: true })
  fireResist?: number;

  @Field({ nullable: true })
  int?: number;

  @Field({ nullable: true })
  life?: number;

  @Field({ nullable: true })
  lightningResist?: number;

  @Field({ nullable: true })
  mana?: number;

  @Field({ nullable: true })
  str?: number;

  @Field({ nullable: true })
  evasion?: number;

  @Field({ nullable: true })
  supression?: number;

  @Field({ nullable: true })
  totalDpsWithIgnite?: number;

  @Field({ nullable: true })
  pobCode?: string;
}

@ObjectType("CharacterSnapshotRecord")
export class GqlCharacterSnapshotRecord {
  @Field()
  id: string;

  @Field()
  characterId: string;

  @Field()
  timestamp: Date;

  @Field(() => GraphQLBigInt)
  experience: bigint;

  @Field()
  level: number;
}

@ObjectType("CharacterSnapshot")
export class GqlCharacterSnapshot {
  @Field()
  userId: string;

  @Field()
  poeProfileName: string;

  @Field()
  id: string;

  @Field()
  characterId: string;

  @Field()
  timestamp: string;

  @Field()
  characterClass: string;

  @Field()
  league: string;

  @Field(() => GraphQLBigInt)
  experience: bigint;

  @Field()
  level: number;

  @Field()
  current: boolean;

  @Field({ nullable: true })
  totalValueChaos?: number;

  @Field({ nullable: true })
  totalValueDivine?: number;

  @Field({ nullable: true })
  mainSkillKey?: string;

  @Field({ nullable: true })
  poeCharacter?: GqlPoeCharacter;

  @Field({ nullable: true })
  characterPassivesSnapshot?: GqlCharacterPassivesSnapshot;

  @Field(() => [GqlCharacterSnapshotItem], { nullable: true })
  characterSnapshotItems?: GqlCharacterSnapshotItem[];

  @Field(() => GqlCharacterSnapshotPobStats, { nullable: true })
  characterSnapshotPobStats?: GqlCharacterSnapshotPobStats;
}

@InputType("AtlasPassiveSnapshotSearch")
export class GqlAtlasPassiveSnapshotSearch {
  @Field({ nullable: true })
  league?: string;

  @Field({ nullable: true })
  timestampEndInclusive?: Date;

  @Field(() => [String], { nullable: true })
  includedHashes?: string[];

  @Field(() => [String], { nullable: true })
  excludedHashes?: string[];
}

@InputType("CharacterSnapshotSearch")
export class GqlCharacterSnapshotSearch {
  @Field({ nullable: true })
  league?: string;

  @Field({ nullable: true })
  customLadderGroupId?: string;

  @Field(() => [String], { nullable: true })
  includedCharacterIds?: string[];
}

@ObjectType("GenericAggregation")
export class GqlGenericAggregation {
  @Field(() => [GqlGenericIntKeyValue])
  values: GqlGenericIntKeyValue[];
}

@ObjectType("GenericIntKeyValue")
export class GqlGenericIntKeyValue {
  @Field({ nullable: true })
  timestamp?: Date;

  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  value?: number;
}

@ObjectType("CharacterSnapshotSearchResponseEntry")
export class GqlCharacterSnapshotSearchResponseEntry {
  @Field()
  characterId: string;

  @Field()
  name: string;

  @Field()
  league: string;

  @Field()
  level: number;

  @Field()
  characterClass: string;

  @Field({ nullable: true })
  mainSkillKey?: string;

  @Field({ nullable: true })
  energyShield?: number;

  @Field({ nullable: true })
  life?: number;

  @Field({ nullable: true })
  snapshotId?: string;

  @Field({ nullable: true })
  twitchProfileName?: string;

  @Field({ nullable: true })
  pobDps?: number;

  @Field({ nullable: true })
  totalValueChaos?: number;

  @Field({ nullable: true })
  totalValueDivine?: number;

  @Field(() => [GraphQLJSON], { nullable: true })
  topItems?: any[];

  @Field()
  current: boolean;
}

@ObjectType("CharacterSnapshotSearchResponse")
export class GqlCharacterSnapshotSearchResponse {
  @Field(() => [GqlCharacterSnapshotSearchResponseEntry])
  snapshots: GqlCharacterSnapshotSearchResponseEntry[];

  @Field()
  hasMore: boolean;
}

@ObjectType("CharacterSnapshotSearchAggregationsResponse")
export class GqlCharacterSnapshotSearchAggregationsResponse {
  @Field(() => GqlGenericAggregation, { nullable: true })
  characterClassAggregation?: GqlGenericAggregation;

  @Field(() => GqlGenericAggregation, { nullable: true })
  characterClassTimeseriesAggregation?: GqlGenericAggregation;

  @Field(() => GqlGenericAggregation, { nullable: true })
  mainSkillTimeseriesAggregation?: GqlGenericAggregation;

  @Field(() => GqlGenericAggregation, { nullable: true })
  levelTimeseriesAggregation?: GqlGenericAggregation;

  @Field(() => GqlGenericAggregation, { nullable: true })
  keystoneAggregation?: GqlGenericAggregation;

  @Field(() => GqlGenericAggregation, { nullable: true })
  mainSkillAggreagtion?: GqlGenericAggregation;

  @Field(() => GqlGenericAggregation, { nullable: true })
  itemKeyAggreagtion?: GqlGenericAggregation;

  @Field({ nullable: true })
  totalMatches?: number;
}

@ObjectType("CharacterSnapshotUniqueAggregationKeysResponse")
export class GqlCharacterSnapshotUniqueAggregationKeysResponse {
  @Field(() => [String])
  characterClassKeys?: string[];

  @Field(() => [String])
  keystoneKeys?: string[];

  @Field(() => [String])
  mainSkillKeys?: string[];

  @Field(() => [String])
  itemKeys?: string[];
}

@ObjectType("CustomLadderMember")
@InputType("CustomLadderMemberInput")
export class GqlCustomLadderGroupMember {
  @Field()
  userId: string;
  @Field()
  poeProfileName: string;
}

@InputType("CustomLadderGroupInput")
export class GqlCustomLadderGroupInput {
  @Field()
  id: string;
  @Field()
  name: string;

  @Field(() => [GqlCustomLadderGroupMember])
  members?: GqlCustomLadderGroupMember[];
}

@ObjectType("CustomLadderGroup")
export class GqlCustomLadderGroup {
  @Field()
  id: string;
  @Field()
  ownerUserId: string;
  @Field()
  name: string;
  @Field()
  createdAtTimestamp: Date;

  @Field(() => [GqlCustomLadderGroupMember])
  members?: GqlCustomLadderGroupMember[];
}

@ObjectType("AtlasPassiveSnapshot")
export class GqlAtlasPassiveSnapshot {
  @Field()
  userId: string;
  @Field()
  league: string;
  @Field()
  source: string;

  @Field()
  systemSnapshotTimestamp: Date;
  @Field()
  createdAtTimestamp: Date;

  @Field(() => [Number])
  hashes: number[];
}

@ObjectType("AtlasPassiveSnapshotResponse")
export class GqlAtlasPassiveSnapshotResponse {
  @Field(() => [GqlAtlasPassiveSnapshot])
  results?: GqlAtlasPassiveSnapshot[];
}

@ObjectType("PublicStashUpdateRecord")
export class GqlPublicStashUpdateRecord {
  @Field()
  publicStashId: string;

  @Field()
  league: string;

  @Field()
  poeProfileName: string;

  @Field()
  createdAtTimestamp: Date;
  @Field()
  updatedAtTimestamp: Date;

  @Field()
  delisted: boolean;

  @Field({ nullable: true })
  lastPoeCharacterName: string;
  @Field({ nullable: true })
  stashName: string;
  @Field({ nullable: true })
  stashType: string;
}

@ObjectType("PublicStashUpdateRecordResponse")
export class GqlPublicStashUpdateRecordResponse {
  @Field(() => [GqlPublicStashUpdateRecord])
  results?: GqlPublicStashUpdateRecord[];
}

@InputType("PublicStashUpdateRecordSearch")
export class GqlPublicStashUpdateRecordSearch {
  @Field(() => [String])
  poeProfileNames: string[];
}

@InputType("StashViewSnapshotInput")
export class GqlStashViewSnapshotInput {
  @Field()
  league: string;
  @Field(() => [String])
  stashIds: string[];
}

@ObjectType("StashViewValueSnapshotSeries")
export class GqlStashViewValueSnapshotSeries {
  @Field()
  stashId: string;
  @Field(() => [Number])
  values: number[];
  @Field(() => [Date])
  timestamps: Date[];
}

@ObjectType("StashViewJob")
export class GqlStashViewJob {
  @Field()
  id: string;
  @Field()
  userId: string;
  @Field()
  status: string;
  @Field()
  timestamp: Date;
  @Field({ nullable: true })
  rateLimitEndTimestamp?: Date;
}

@InputType("StashViewStashSummarySearch")
export class GqlStashViewStashSummarySearch {
  @Field()
  league: string;

  @Field({ nullable: true, defaultValue: null })
  opaqueKey?: string;

  @Field({ nullable: true, defaultValue: null })
  execludeNonItemGroups?: boolean;
}

@ObjectType("StashViewStashSummary")
export class GqlStashViewStashSummary {
  @Field(() => [GqlStashViewItemSummary])
  items: GqlStashViewItemSummary[];

  @Field(() => [GqlItemGroup])
  itemGroups: GqlItemGroup[];
}

@ObjectType("StashViewItemSummary")
export class GqlStashViewItemSummary {
  @Field()
  itemId: string;
  @Field()
  userId: string;
  @Field()
  league: string;
  @Field()
  stashId: string;

  @Field()
  x: number;
  @Field()
  y: number;
  @Field()
  quantity: number;

  @Field()
  searchableString: string;

  @Field({ nullable: true })
  itemGroupHashString?: string;
  @Field({ nullable: true })
  itemGroupTag?: string;

  @Field({ nullable: true })
  valueChaos?: number;
  @Field({ nullable: true })
  totalValueChaos?: number;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  itemGroup?: GqlItemGroup;
}

@InputType("StashViewSettings")
export class GqlStashViewSettings {
  @Field()
  league: string;
  @Field()
  chaosToDivRate: number;

  @Field({ nullable: true })
  searchString: string;
  @Field()
  filterCheckedTabs: boolean;

  @Field({ nullable: true })
  selectedTabId?: string;
  @Field(() => [String])
  checkedTabIds: string[];
  @Field(() => [String], { nullable: true })
  checkedTags?: string[];

  @Field()
  valueOverridesEnabled: boolean;
  @Field(() => GraphQLJSONObject)
  itemGroupValueOverrides: Record<string, number>;

  @Field({ nullable: true })
  selectedExporter?: string;
  @Field()
  exporterListedValueMultipler: number;

  @Field(() => [String])
  excludedItemGroupIds: string[];

  @Field({ nullable: true })
  minItemQuantity?: number;
  @Field({ nullable: true })
  minItemValue?: number;
  @Field({ nullable: true })
  minItemStackValue?: number;

  @Field({ nullable: true })
  ign?: string;
  @Field({ nullable: true })
  tftSelectedCategory?: string;
  @Field({ nullable: true })
  tftSelectedSubCategory?: string;
}

@ObjectType("OneClickMessageHistory")
export class GqlOneClickMessageHistory {
  @Field()
  messageId: string;
  @Field()
  channelId: string;
  @Field()
  userId: string;
  @Field()
  timestamp: Date;

  @Field()
  exportType: string;
  @Field({ nullable: true })
  exportSubType: string;
  @Field()
  rateLimitExpires: Date;
}

@ObjectType("ItemGroupListing")
export class GqlItemGroupListing {
  @Field()
  listedAtTimestamp: Date;
  @Field()
  quantity: number;
  @Field()
  listedValue: number;
}

@InputType("StashViewAutomaticSnapshotSettingsInput")
export class GqlStashViewAutomaticSnapshotSettingsInput {
  @Field()
  league: string;
  @Field(() => [String])
  stashIds: string[];
  @Field()
  durationBetweenSnapshotsSeconds: number;
}

@ObjectType("StashViewAutomaticSnapshotSettings")
export class GqlStashViewAutomaticSnapshotSettings {
  @Field()
  userId: string;
  @Field()
  league: string;

  @Field(() => [String])
  stashIds: string[];

  @Field()
  durationBetweenSnapshotsSeconds: number;
  @Field()
  nextSnapshotTimestamp: Date;
}

@ObjectType("TftLiveListing")
export class GqlTftLiveListing {
  @Field()
  channelId: string;
  @Field()
  messageId: string;
  @Field()
  userDiscordId: string;
  @Field()
  userDiscordName: string;
  @Field({ nullable: true })
  userDiscordDisplayRole?: string;
  @Field({ nullable: true })
  userDiscordHighestRole?: string;
  @Field({ nullable: true })
  userDiscordDisplayRoleColor?: string;
  @Field()
  updatedAtTimestamp: Date;
  @Field({ nullable: true })
  delistedAtTimestamp: Date;

  @Field()
  tag: string;
  @Field()
  body: string;

  @Field(() => GraphQLJSONObject)
  properties: any;
}

@InputType("TftLiveListingSearchProperty")
export class GqlTftLiveListingSearchProperty {
  @Field({ defaultValue: "gte" })
  type: string;

  @Field()
  key: string;

  @Field()
  value: string;
}

@InputType("TftLiveListingSearchPropertyGroup")
export class GqlTftLiveListingSearchPropertyGroup {
  @Field({ defaultValue: "and" })
  type: string;

  @Field(() => [GqlTftLiveListingSearchProperty])
  filters: GqlTftLiveListingSearchProperty[];
}

@InputType("TftLiveListingSearch")
export class GqlTftLiveListingSearch {
  @Field()
  tag: string;

  @Field(() => [GqlTftLiveListingSearchPropertyGroup])
  propertyFilterGroups: GqlTftLiveListingSearchPropertyGroup[];
}

@ObjectType("LivePricingValuation")
export class GqlLivePricingValuation {
  @Field()
  listingPercent: number;
  @Field()
  quantity: number;

  @Field()
  value: number;
  @Field()
  valueIndex: number;

  @Field(() => [GqlItemGroupListing])
  validListings: GqlItemGroupListing[];
  @Field()
  validListingsLength: number;
}

@ObjectType("LivePricingResult")
export class GqlLivePricingResult {
  @Field()
  allListingsLength: number;
  @Field(() => [GqlLivePricingValuation])
  valuations: GqlLivePricingValuation[];
}

@ObjectType("LivePricingSimpleResult")
export class GqlLivePricingSimpleResult {
  @Field()
  allListingsLength: number;

  @Field(() => GqlLivePricingValuation)
  valuation: GqlLivePricingValuation;
  @Field(() => GqlLivePricingValuation)
  stockValuation: GqlLivePricingValuation;
}

@InputType("LivePricingSimpleConfig")
export class GqlLivePricingSimpleConfig {
  @Field()
  league: string;
  @Field()
  itemGroupHashString: string;
  @Field()
  quantity: number;
  @Field({ nullable: true })
  listingPercent?: number;
}

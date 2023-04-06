import { GraphQLResolveInfo } from 'graphql';
import { PoeStackContext } from '../../index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type PoeApiCharacter = {
  __typename?: 'PoeApiCharacter';
  class?: Maybe<Scalars['String']>;
  current?: Maybe<Scalars['Boolean']>;
  deleted?: Maybe<Scalars['Boolean']>;
  equipment?: Maybe<Array<Maybe<PoeApiItem>>>;
  experience?: Maybe<Scalars['Float']>;
  expired?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  inventory?: Maybe<Array<Maybe<PoeApiItem>>>;
  jewels?: Maybe<Array<Maybe<PoeApiItem>>>;
  league?: Maybe<Scalars['String']>;
  level?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  passives?: Maybe<PoeApiCharacterPassive>;
};

export type PoeApiCharacterPassive = {
  __typename?: 'PoeApiCharacterPassive';
  bandit_choice?: Maybe<Scalars['String']>;
  hashes?: Maybe<Array<Maybe<Scalars['Float']>>>;
  hashes_ex?: Maybe<Array<Maybe<Scalars['Float']>>>;
  pantheon_major?: Maybe<Scalars['String']>;
  pantheon_minor?: Maybe<Scalars['String']>;
};

export type PoeApiFlavourTextInfo = {
  __typename?: 'PoeApiFlavourTextInfo';
  class?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type PoeApiInflunce = {
  __typename?: 'PoeApiInflunce';
  name?: Maybe<Scalars['String']>;
};

export type PoeApiItem = {
  __typename?: 'PoeApiItem';
  abyssJewel?: Maybe<Scalars['Boolean']>;
  additionalProperties?: Maybe<Array<Maybe<PoeApiItemProperty>>>;
  artFilename?: Maybe<Scalars['String']>;
  baseType?: Maybe<Scalars['String']>;
  cisRaceReward?: Maybe<Scalars['Boolean']>;
  colour?: Maybe<Scalars['String']>;
  corrupted?: Maybe<Scalars['Boolean']>;
  cosmeticMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  craftedMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  crucible?: Maybe<PoeApiItemCrucibleMods>;
  delve?: Maybe<Scalars['Boolean']>;
  descrText?: Maybe<Scalars['String']>;
  duplicated?: Maybe<Scalars['Boolean']>;
  elder?: Maybe<Scalars['Boolean']>;
  enchantMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  explicitMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  extended?: Maybe<PoeApiItemExtended>;
  flavourText?: Maybe<Array<Maybe<Scalars['String']>>>;
  flavourTextParsed?: Maybe<Array<Maybe<PoeApiFlavourTextInfo>>>;
  foilVariation?: Maybe<Scalars['Int']>;
  forum_note?: Maybe<Scalars['String']>;
  fractured?: Maybe<Scalars['Boolean']>;
  fracturedMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  frameType?: Maybe<Scalars['Float']>;
  h?: Maybe<Scalars['Int']>;
  hybrid?: Maybe<PoeApiItemHybrid>;
  icon?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  identified?: Maybe<Scalars['Boolean']>;
  implicitMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  incubatedItem?: Maybe<PoeApiItemIncubatedItem>;
  influences?: Maybe<PoeApiInflunce>;
  inventoryId?: Maybe<Scalars['String']>;
  isRelic?: Maybe<Scalars['Boolean']>;
  itemLevel?: Maybe<Scalars['Int']>;
  league?: Maybe<Scalars['String']>;
  lockedToAccount?: Maybe<Scalars['Boolean']>;
  lockedToCharacter?: Maybe<Scalars['Boolean']>;
  logbookMods?: Maybe<Array<Maybe<PoeApiItemLogbookMod>>>;
  maxStackSize?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  nextLevelRequirements?: Maybe<Array<Maybe<PoeApiItemProperty>>>;
  notableProperties?: Maybe<Array<Maybe<PoeApiItemProperty>>>;
  note?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<Maybe<PoeApiItemProperty>>>;
  prophecyText?: Maybe<Scalars['String']>;
  replica?: Maybe<Scalars['Boolean']>;
  requirements?: Maybe<Array<Maybe<PoeApiItemProperty>>>;
  ruthless?: Maybe<Scalars['Boolean']>;
  scourgeMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  scourged?: Maybe<PoeApiItemScourged>;
  seaRaceReward?: Maybe<Scalars['Boolean']>;
  searing?: Maybe<Scalars['Boolean']>;
  secDescrText?: Maybe<Scalars['String']>;
  shaper?: Maybe<Scalars['Boolean']>;
  socket?: Maybe<Scalars['Int']>;
  socketedItems?: Maybe<Array<Maybe<PoeApiItem>>>;
  sockets?: Maybe<Array<Maybe<PoeApiItemSocket>>>;
  split?: Maybe<Scalars['Boolean']>;
  stackSize?: Maybe<Scalars['Int']>;
  stackSizeText?: Maybe<Scalars['String']>;
  support?: Maybe<Scalars['Boolean']>;
  synthesised?: Maybe<Scalars['Boolean']>;
  talismanTier?: Maybe<Scalars['Int']>;
  tangled?: Maybe<Scalars['Boolean']>;
  thRaceReward?: Maybe<Scalars['Boolean']>;
  typeLine?: Maybe<Scalars['String']>;
  ultimatumMods?: Maybe<Array<Maybe<PoeApiItemUltimatumMods>>>;
  unmodifiable?: Maybe<Scalars['Boolean']>;
  utilityMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  veiled?: Maybe<Scalars['Boolean']>;
  veiledMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  verified?: Maybe<Scalars['Boolean']>;
  w?: Maybe<Scalars['Int']>;
  x?: Maybe<Scalars['Int']>;
  y?: Maybe<Scalars['Int']>;
};

export type PoeApiItemCrucibleMods = {
  __typename?: 'PoeApiItemCrucibleMods';
  layout?: Maybe<Scalars['String']>;
};

export type PoeApiItemCrucibleNode = {
  __typename?: 'PoeApiItemCrucibleNode';
  allocated?: Maybe<Scalars['Boolean']>;
  icon?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  orbit?: Maybe<Scalars['Int']>;
  orbitIndex?: Maybe<Scalars['Int']>;
  out?: Maybe<Array<Maybe<Scalars['String']>>>;
  skill?: Maybe<Scalars['String']>;
  stats?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type PoeApiItemExtended = {
  __typename?: 'PoeApiItemExtended';
  category?: Maybe<Scalars['String']>;
  prefixes?: Maybe<Scalars['Float']>;
  subcategories?: Maybe<Array<Maybe<Scalars['String']>>>;
  suffixes?: Maybe<Scalars['Float']>;
};

export type PoeApiItemHybrid = {
  __typename?: 'PoeApiItemHybrid';
  baseTypeName?: Maybe<Scalars['String']>;
  explicitMods?: Maybe<Array<Maybe<Scalars['String']>>>;
  isVaalGem?: Maybe<Scalars['Boolean']>;
  properties?: Maybe<Array<Maybe<PoeApiItemProperty>>>;
  secDescrText?: Maybe<Scalars['String']>;
};

export type PoeApiItemIncubatedItem = {
  __typename?: 'PoeApiItemIncubatedItem';
  level?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  progress?: Maybe<Scalars['Float']>;
  total?: Maybe<Scalars['Float']>;
};

export type PoeApiItemLogbookFaction = {
  __typename?: 'PoeApiItemLogbookFaction';
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type PoeApiItemLogbookMod = {
  __typename?: 'PoeApiItemLogbookMod';
  faction?: Maybe<PoeApiItemLogbookFaction>;
  mod?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
};

export type PoeApiItemProperty = {
  __typename?: 'PoeApiItemProperty';
  displayMode?: Maybe<Scalars['Float']>;
  name?: Maybe<Scalars['String']>;
  progress?: Maybe<Scalars['Float']>;
  suffix?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['Float']>;
  values?: Maybe<Array<Maybe<Array<Maybe<Scalars['String']>>>>>;
};

export type PoeApiItemScourged = {
  __typename?: 'PoeApiItemScourged';
  level?: Maybe<Scalars['Float']>;
  progress?: Maybe<Scalars['Float']>;
  tier?: Maybe<Scalars['Float']>;
  total?: Maybe<Scalars['Float']>;
};

export type PoeApiItemSocket = {
  __typename?: 'PoeApiItemSocket';
  attr?: Maybe<Scalars['String']>;
  group?: Maybe<Scalars['Int']>;
  sColour?: Maybe<Scalars['String']>;
};

export type PoeApiItemUltimatumMods = {
  __typename?: 'PoeApiItemUltimatumMods';
  tier?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
};

export type PoeApiProfile = {
  __typename?: 'PoeApiProfile';
  guild?: Maybe<PoeApiProfileGuild>;
  name?: Maybe<Scalars['String']>;
  realm?: Maybe<Scalars['String']>;
  twitch?: Maybe<PoeApiProfileTwitch>;
  uuid?: Maybe<Scalars['String']>;
};

export type PoeApiProfileGuild = {
  __typename?: 'PoeApiProfileGuild';
  name?: Maybe<Scalars['String']>;
};

export type PoeApiProfileTwitch = {
  __typename?: 'PoeApiProfileTwitch';
  name?: Maybe<Scalars['String']>;
};

export type PoeApiPublicStashChange = {
  __typename?: 'PoeApiPublicStashChange';
  accountName?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  items?: Maybe<Array<Maybe<PoeApiItem>>>;
  league?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  stash?: Maybe<Scalars['String']>;
  stashType?: Maybe<Scalars['String']>;
};

export type PoeApiPublicStashResponse = {
  __typename?: 'PoeApiPublicStashResponse';
  next_change_id?: Maybe<Scalars['String']>;
  stashes?: Maybe<Array<Maybe<PoeApiPublicStashChange>>>;
};

export type PoeApiStashTab = {
  __typename?: 'PoeApiStashTab';
  children?: Maybe<Array<Maybe<PoeApiStashTab>>>;
  id?: Maybe<Scalars['String']>;
  index?: Maybe<Scalars['Float']>;
  items?: Maybe<Array<Maybe<PoeApiItem>>>;
  metadata?: Maybe<PoeApiStashTabMetadata>;
  name?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type PoeApiStashTabMetadata = {
  __typename?: 'PoeApiStashTabMetadata';
  colour?: Maybe<Scalars['String']>;
  folder?: Maybe<Scalars['Boolean']>;
  public?: Maybe<Scalars['Boolean']>;
};

export type PoeApiTokenExchangeResponse = {
  __typename?: 'PoeApiTokenExchangeResponse';
  access_token?: Maybe<Scalars['String']>;
  expires_in?: Maybe<Scalars['String']>;
  refresh_token?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['String']>;
  token_type?: Maybe<Scalars['String']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  PoeApiCharacter: ResolverTypeWrapper<PoeApiCharacter>;
  PoeApiCharacterPassive: ResolverTypeWrapper<PoeApiCharacterPassive>;
  PoeApiFlavourTextInfo: ResolverTypeWrapper<PoeApiFlavourTextInfo>;
  PoeApiInflunce: ResolverTypeWrapper<PoeApiInflunce>;
  PoeApiItem: ResolverTypeWrapper<PoeApiItem>;
  PoeApiItemCrucibleMods: ResolverTypeWrapper<PoeApiItemCrucibleMods>;
  PoeApiItemCrucibleNode: ResolverTypeWrapper<PoeApiItemCrucibleNode>;
  PoeApiItemExtended: ResolverTypeWrapper<PoeApiItemExtended>;
  PoeApiItemHybrid: ResolverTypeWrapper<PoeApiItemHybrid>;
  PoeApiItemIncubatedItem: ResolverTypeWrapper<PoeApiItemIncubatedItem>;
  PoeApiItemLogbookFaction: ResolverTypeWrapper<PoeApiItemLogbookFaction>;
  PoeApiItemLogbookMod: ResolverTypeWrapper<PoeApiItemLogbookMod>;
  PoeApiItemProperty: ResolverTypeWrapper<PoeApiItemProperty>;
  PoeApiItemScourged: ResolverTypeWrapper<PoeApiItemScourged>;
  PoeApiItemSocket: ResolverTypeWrapper<PoeApiItemSocket>;
  PoeApiItemUltimatumMods: ResolverTypeWrapper<PoeApiItemUltimatumMods>;
  PoeApiProfile: ResolverTypeWrapper<PoeApiProfile>;
  PoeApiProfileGuild: ResolverTypeWrapper<PoeApiProfileGuild>;
  PoeApiProfileTwitch: ResolverTypeWrapper<PoeApiProfileTwitch>;
  PoeApiPublicStashChange: ResolverTypeWrapper<PoeApiPublicStashChange>;
  PoeApiPublicStashResponse: ResolverTypeWrapper<PoeApiPublicStashResponse>;
  PoeApiStashTab: ResolverTypeWrapper<PoeApiStashTab>;
  PoeApiStashTabMetadata: ResolverTypeWrapper<PoeApiStashTabMetadata>;
  PoeApiTokenExchangeResponse: ResolverTypeWrapper<PoeApiTokenExchangeResponse>;
  String: ResolverTypeWrapper<Scalars['String']>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  PoeApiCharacter: PoeApiCharacter;
  PoeApiCharacterPassive: PoeApiCharacterPassive;
  PoeApiFlavourTextInfo: PoeApiFlavourTextInfo;
  PoeApiInflunce: PoeApiInflunce;
  PoeApiItem: PoeApiItem;
  PoeApiItemCrucibleMods: PoeApiItemCrucibleMods;
  PoeApiItemCrucibleNode: PoeApiItemCrucibleNode;
  PoeApiItemExtended: PoeApiItemExtended;
  PoeApiItemHybrid: PoeApiItemHybrid;
  PoeApiItemIncubatedItem: PoeApiItemIncubatedItem;
  PoeApiItemLogbookFaction: PoeApiItemLogbookFaction;
  PoeApiItemLogbookMod: PoeApiItemLogbookMod;
  PoeApiItemProperty: PoeApiItemProperty;
  PoeApiItemScourged: PoeApiItemScourged;
  PoeApiItemSocket: PoeApiItemSocket;
  PoeApiItemUltimatumMods: PoeApiItemUltimatumMods;
  PoeApiProfile: PoeApiProfile;
  PoeApiProfileGuild: PoeApiProfileGuild;
  PoeApiProfileTwitch: PoeApiProfileTwitch;
  PoeApiPublicStashChange: PoeApiPublicStashChange;
  PoeApiPublicStashResponse: PoeApiPublicStashResponse;
  PoeApiStashTab: PoeApiStashTab;
  PoeApiStashTabMetadata: PoeApiStashTabMetadata;
  PoeApiTokenExchangeResponse: PoeApiTokenExchangeResponse;
  String: Scalars['String'];
}>;

export type PoeApiCharacterResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiCharacter'] = ResolversParentTypes['PoeApiCharacter']> = ResolversObject<{
  class?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  current?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  equipment?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItem']>>>, ParentType, ContextType>;
  experience?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  expired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  inventory?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItem']>>>, ParentType, ContextType>;
  jewels?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItem']>>>, ParentType, ContextType>;
  league?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  level?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  passives?: Resolver<Maybe<ResolversTypes['PoeApiCharacterPassive']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiCharacterPassiveResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiCharacterPassive'] = ResolversParentTypes['PoeApiCharacterPassive']> = ResolversObject<{
  bandit_choice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hashes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Float']>>>, ParentType, ContextType>;
  hashes_ex?: Resolver<Maybe<Array<Maybe<ResolversTypes['Float']>>>, ParentType, ContextType>;
  pantheon_major?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pantheon_minor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiFlavourTextInfoResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiFlavourTextInfo'] = ResolversParentTypes['PoeApiFlavourTextInfo']> = ResolversObject<{
  class?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiInflunceResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiInflunce'] = ResolversParentTypes['PoeApiInflunce']> = ResolversObject<{
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItem'] = ResolversParentTypes['PoeApiItem']> = ResolversObject<{
  abyssJewel?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  additionalProperties?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemProperty']>>>, ParentType, ContextType>;
  artFilename?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  baseType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cisRaceReward?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  colour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  corrupted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  cosmeticMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  craftedMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  crucible?: Resolver<Maybe<ResolversTypes['PoeApiItemCrucibleMods']>, ParentType, ContextType>;
  delve?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  descrText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duplicated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  elder?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  enchantMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  explicitMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  extended?: Resolver<Maybe<ResolversTypes['PoeApiItemExtended']>, ParentType, ContextType>;
  flavourText?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  flavourTextParsed?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiFlavourTextInfo']>>>, ParentType, ContextType>;
  foilVariation?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  forum_note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fractured?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  fracturedMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  frameType?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  h?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hybrid?: Resolver<Maybe<ResolversTypes['PoeApiItemHybrid']>, ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  identified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  implicitMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  incubatedItem?: Resolver<Maybe<ResolversTypes['PoeApiItemIncubatedItem']>, ParentType, ContextType>;
  influences?: Resolver<Maybe<ResolversTypes['PoeApiInflunce']>, ParentType, ContextType>;
  inventoryId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isRelic?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  itemLevel?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  league?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lockedToAccount?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lockedToCharacter?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  logbookMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemLogbookMod']>>>, ParentType, ContextType>;
  maxStackSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nextLevelRequirements?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemProperty']>>>, ParentType, ContextType>;
  notableProperties?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemProperty']>>>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  properties?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemProperty']>>>, ParentType, ContextType>;
  prophecyText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  replica?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  requirements?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemProperty']>>>, ParentType, ContextType>;
  ruthless?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  scourgeMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  scourged?: Resolver<Maybe<ResolversTypes['PoeApiItemScourged']>, ParentType, ContextType>;
  seaRaceReward?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  searing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  secDescrText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shaper?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  socket?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  socketedItems?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItem']>>>, ParentType, ContextType>;
  sockets?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemSocket']>>>, ParentType, ContextType>;
  split?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  stackSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stackSizeText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  support?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  synthesised?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  talismanTier?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tangled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  thRaceReward?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  typeLine?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ultimatumMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemUltimatumMods']>>>, ParentType, ContextType>;
  unmodifiable?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  utilityMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  veiled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  veiledMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  w?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  x?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  y?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemCrucibleModsResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemCrucibleMods'] = ResolversParentTypes['PoeApiItemCrucibleMods']> = ResolversObject<{
  layout?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemCrucibleNodeResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemCrucibleNode'] = ResolversParentTypes['PoeApiItemCrucibleNode']> = ResolversObject<{
  allocated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  in?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  orbit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  orbitIndex?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  out?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  skill?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stats?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemExtendedResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemExtended'] = ResolversParentTypes['PoeApiItemExtended']> = ResolversObject<{
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  prefixes?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  subcategories?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  suffixes?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemHybridResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemHybrid'] = ResolversParentTypes['PoeApiItemHybrid']> = ResolversObject<{
  baseTypeName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  explicitMods?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isVaalGem?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  properties?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItemProperty']>>>, ParentType, ContextType>;
  secDescrText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemIncubatedItemResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemIncubatedItem'] = ResolversParentTypes['PoeApiItemIncubatedItem']> = ResolversObject<{
  level?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  progress?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemLogbookFactionResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemLogbookFaction'] = ResolversParentTypes['PoeApiItemLogbookFaction']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemLogbookModResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemLogbookMod'] = ResolversParentTypes['PoeApiItemLogbookMod']> = ResolversObject<{
  faction?: Resolver<Maybe<ResolversTypes['PoeApiItemLogbookFaction']>, ParentType, ContextType>;
  mod?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemPropertyResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemProperty'] = ResolversParentTypes['PoeApiItemProperty']> = ResolversObject<{
  displayMode?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  progress?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  suffix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  values?: Resolver<Maybe<Array<Maybe<Array<Maybe<ResolversTypes['String']>>>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemScourgedResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemScourged'] = ResolversParentTypes['PoeApiItemScourged']> = ResolversObject<{
  level?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  progress?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  tier?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemSocketResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemSocket'] = ResolversParentTypes['PoeApiItemSocket']> = ResolversObject<{
  attr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sColour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiItemUltimatumModsResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiItemUltimatumMods'] = ResolversParentTypes['PoeApiItemUltimatumMods']> = ResolversObject<{
  tier?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiProfileResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiProfile'] = ResolversParentTypes['PoeApiProfile']> = ResolversObject<{
  guild?: Resolver<Maybe<ResolversTypes['PoeApiProfileGuild']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  realm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twitch?: Resolver<Maybe<ResolversTypes['PoeApiProfileTwitch']>, ParentType, ContextType>;
  uuid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiProfileGuildResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiProfileGuild'] = ResolversParentTypes['PoeApiProfileGuild']> = ResolversObject<{
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiProfileTwitchResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiProfileTwitch'] = ResolversParentTypes['PoeApiProfileTwitch']> = ResolversObject<{
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiPublicStashChangeResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiPublicStashChange'] = ResolversParentTypes['PoeApiPublicStashChange']> = ResolversObject<{
  accountName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItem']>>>, ParentType, ContextType>;
  league?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  public?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  stash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stashType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiPublicStashResponseResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiPublicStashResponse'] = ResolversParentTypes['PoeApiPublicStashResponse']> = ResolversObject<{
  next_change_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stashes?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiPublicStashChange']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiStashTabResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiStashTab'] = ResolversParentTypes['PoeApiStashTab']> = ResolversObject<{
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiStashTab']>>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  index?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['PoeApiItem']>>>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['PoeApiStashTabMetadata']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiStashTabMetadataResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiStashTabMetadata'] = ResolversParentTypes['PoeApiStashTabMetadata']> = ResolversObject<{
  colour?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  folder?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  public?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PoeApiTokenExchangeResponseResolvers<ContextType = PoeStackContext, ParentType extends ResolversParentTypes['PoeApiTokenExchangeResponse'] = ResolversParentTypes['PoeApiTokenExchangeResponse']> = ResolversObject<{
  access_token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expires_in?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refresh_token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = PoeStackContext> = ResolversObject<{
  PoeApiCharacter?: PoeApiCharacterResolvers<ContextType>;
  PoeApiCharacterPassive?: PoeApiCharacterPassiveResolvers<ContextType>;
  PoeApiFlavourTextInfo?: PoeApiFlavourTextInfoResolvers<ContextType>;
  PoeApiInflunce?: PoeApiInflunceResolvers<ContextType>;
  PoeApiItem?: PoeApiItemResolvers<ContextType>;
  PoeApiItemCrucibleMods?: PoeApiItemCrucibleModsResolvers<ContextType>;
  PoeApiItemCrucibleNode?: PoeApiItemCrucibleNodeResolvers<ContextType>;
  PoeApiItemExtended?: PoeApiItemExtendedResolvers<ContextType>;
  PoeApiItemHybrid?: PoeApiItemHybridResolvers<ContextType>;
  PoeApiItemIncubatedItem?: PoeApiItemIncubatedItemResolvers<ContextType>;
  PoeApiItemLogbookFaction?: PoeApiItemLogbookFactionResolvers<ContextType>;
  PoeApiItemLogbookMod?: PoeApiItemLogbookModResolvers<ContextType>;
  PoeApiItemProperty?: PoeApiItemPropertyResolvers<ContextType>;
  PoeApiItemScourged?: PoeApiItemScourgedResolvers<ContextType>;
  PoeApiItemSocket?: PoeApiItemSocketResolvers<ContextType>;
  PoeApiItemUltimatumMods?: PoeApiItemUltimatumModsResolvers<ContextType>;
  PoeApiProfile?: PoeApiProfileResolvers<ContextType>;
  PoeApiProfileGuild?: PoeApiProfileGuildResolvers<ContextType>;
  PoeApiProfileTwitch?: PoeApiProfileTwitchResolvers<ContextType>;
  PoeApiPublicStashChange?: PoeApiPublicStashChangeResolvers<ContextType>;
  PoeApiPublicStashResponse?: PoeApiPublicStashResponseResolvers<ContextType>;
  PoeApiStashTab?: PoeApiStashTabResolvers<ContextType>;
  PoeApiStashTabMetadata?: PoeApiStashTabMetadataResolvers<ContextType>;
  PoeApiTokenExchangeResponse?: PoeApiTokenExchangeResponseResolvers<ContextType>;
}>;


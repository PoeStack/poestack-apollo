import { S3Service } from "./../s3-service";
import { nanoid } from "nanoid";
import PoeApi from "../poe/poe-api";
import ItemGroupingService from "../pricing/item-grouping-service";
import ItemValueHistoryService from "../pricing/item-value-history-service";
import _ from "lodash";
import StopWatch from "../utils/stop-watch";
import { singleton } from "tsyringe";
import {
  ItemGroupInfo,
  type StashSnapshot,
  type StashSnapshotItemGroupSummary,
  type StashSnapshotProfile,
} from "@prisma/client";
import PostgresService from "../mongo/postgres-service";
import {
  GqlDetachedStashSnapshotInput,
  type GqlStashSnapshotItemGroupSearchSummaryAggregationEntry,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
  type GqlStashSnapshotItemGroupSummarySearchAggregationResponse,
  type GqlStashSnapshotItemGroupSummarySearchResponse,
  type GqlStashSnapshotProfile,
  type GqlUserProfile,
} from "../../models/basic-models";
import { PoeService } from "../poe/poe-service";
import { Logger } from "../logger";
import { Prisma } from "@prisma/client";

@singleton()
export default class StashSnapshotService {
  constructor(
    private readonly poeService: PoeService,
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly s3Service: S3Service
  ) {}

  public async startAutomaticSnapshots() {
    for (;;) {
      try {
        const profiles: GqlStashSnapshotProfile[] = await this.postgresService
          .prisma.$queryRaw`
        select id, "userId" from "StashSnapshotProfile" p
        where p."automaticSnapshotIntervalSeconds" is not null
        and ("lastSnapshotTimestamp" is null or extract('epoch' from  "lastSnapshotTimestamp") < extract('epoch' from  now()) - "automaticSnapshotIntervalSeconds")`;

        Logger.info(
          `automatic snapshot job found ${profiles.length} profiles to execute`
        );

        const promises = _.chunk(_.shuffle(profiles), 7).map(async (c) => {
          for (const profile of c) {
            try {
              await this.takeProfileSnapshot(profile.userId, profile.id);
            } catch (error) {
              Logger.error("error while taking automatic snapshot", error);
            }
          }
        });

        await Promise.all(promises);
      } catch (error) {
        Logger.error("error while taking automatic snapshots", error);
      }
      await new Promise((res) => setTimeout(res, 15000));
    }
  }

  public async fetchProfileSafe(
    userId: string,
    snapshotProfileId: string
  ): Promise<StashSnapshotProfile> {
    const snapshotProfile: StashSnapshotProfile =
      await this.postgresService.prisma.stashSnapshotProfile.findFirst({
        where: { id: snapshotProfileId },
      });
    if (!snapshotProfile.public && snapshotProfile.userId !== userId) {
      throw new Error(
        `userid ${userId} cannot access profile ${snapshotProfileId}`
      );
    }
    return snapshotProfile;
  }

  public async fetchSnapshot(snapshotId: string): Promise<StashSnapshot> {
    const resp = await this.postgresService.prisma.stashSnapshot.findFirst({
      where: { id: snapshotId },
    });
    return resp;
  }

  private searchToWhere(search: GqlStashSnapshotItemGroupSummarySearch) {
    const searchConditions: Prisma.Sql[] = [];
    searchConditions.push(
      Prisma.sql`si."stashSnapshotId" = ${search.snapshotId}`
    );

    if (search.excludedItemGroupHashStrings?.length) {
      searchConditions.push(
        Prisma.sql`si."itemGroupHashString" not in (${Prisma.join(
          search.excludedItemGroupHashStrings
        )})`
      );
    }

    if (search.minTotalValueChaos > 0) {
      searchConditions.push(
        Prisma.sql`si."totalValueChaos" >= ${search.minTotalValueChaos}`
      );
    }

    if (search.minValueChaos > 0) {
      searchConditions.push(
        Prisma.sql`si."valueChaos" >= ${search.minValueChaos}`
      );
    }

    if (search.tags?.length) {
      if (search.tags.includes("heist") && !search.tags.includes("contract")) {
        search.tags.push(...["contract", "blueprint"]);
      }
      searchConditions.push(
        Prisma.sql`ig."tag" in (${Prisma.join(search.tags)})`
      );
    }

    if (search.keys?.length) {
      searchConditions.push(
        Prisma.sql`ig."key" in (${Prisma.join(search.keys)})`
      );
    }

    const where =
      searchConditions.length > 0
        ? Prisma.sql`where ${Prisma.join(searchConditions, " and ")}`
        : Prisma.empty;
    return where;
  }

  public async fetchStashSnapshotItemSummariesAggregation(
    aggregation: string,
    search: GqlStashSnapshotItemGroupSummarySearch
  ): Promise<GqlStashSnapshotItemGroupSummarySearchAggregationResponse> {
    const qResp = await this.postgresService.prisma.$queryRaw`
    select p.tag as "key", sum(s."totalValueChaos") as "value", count(*) as "matches" from "StashSnapshotItemGroupSummary" s
    inner join "ItemGroupInfo" p ON s."itemGroupHashString" = p."hashString"
    where s."stashSnapshotId" = ${search.snapshotId}
    group by p.tag 
    order by value desc`;

    const resp: GqlStashSnapshotItemGroupSummarySearchAggregationResponse = {
      entries:
        qResp as GqlStashSnapshotItemGroupSearchSummaryAggregationEntry[],
    };
    return resp;
  }

  public async fetchStashSnapshotItemSummaries(
    search: GqlStashSnapshotItemGroupSummarySearch
  ): Promise<GqlStashSnapshotItemGroupSummarySearchResponse> {
    const limit = search.limit ?? 20;

    const where = this.searchToWhere(search);

    const itemSummaries: GqlStashSnapshotItemGroupSummary[] = await this
      .postgresService.prisma.$queryRaw`
      select * from "StashSnapshotItemGroupSummary" si
      left join "ItemGroupInfo" ig on si."itemGroupHashString" = ig."hashString"
      ${where}
      order by si."totalValueChaos" desc
      limit ${limit + 1} offset ${search.skip ?? 0}`;

    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      {
        where: {
          hashString: { in: itemSummaries.map((e) => e.itemGroupHashString) },
        },
      }
    );
    itemSummaries.forEach((is) => {
      is.itemGroup = itemGroups.find(
        (ig) => is.itemGroupHashString === ig.hashString
      ) as unknown as any;
    });

    const totalValueChos: any = await this.postgresService.prisma.$queryRaw`
    select sum("totalValueChaos") from "StashSnapshotItemGroupSummary" si
    left join "ItemGroupInfo" ig on si."itemGroupHashString" = ig."hashString"
    ${where}`;

    const resp: GqlStashSnapshotItemGroupSummarySearchResponse = {
      hasMore: false,
      totalValueChaos: totalValueChos?.[0]?.sum ?? 0,
      itemGroupSummaries: itemSummaries,
    };

    if (itemSummaries.length > limit) {
      resp.hasMore = true;
      resp.itemGroupSummaries = resp.itemGroupSummaries.slice(0, limit);
    }
    return resp;
  }

  public async takeProfileSnapshot(
    userId: string,
    snapshotProfileId: string
  ): Promise<StashSnapshot> {
    const snapshotProfile: GqlStashSnapshotProfile =
      await this.fetchProfileSafe(userId, snapshotProfileId);
    const resp = await this.takeSnapshot(
      snapshotProfile as GqlDetachedStashSnapshotInput,
      snapshotProfile.id
    );
    return resp;
  }

  public async takeSnapshot(
    input: GqlDetachedStashSnapshotInput,
    profileId: string = null
  ): Promise<StashSnapshot> {
    if (profileId !== null) {
      await this.postgresService.prisma.stashSnapshotProfile.update({
        where: { id_userId: { userId: input.userId, id: profileId } },
        data: { lastSnapshotTimestamp: new Date() },
      });
    }

    const sw = new StopWatch(true);

    const userProfile: GqlUserProfile =
      await this.postgresService.prisma.userProfile.findUniqueOrThrow({
        where: { userId: input.userId },
      });

    if (!userProfile.oAuthToken) {
      return null;
    }

    const tabs = await this.poeService.updateStashtabs(
      userProfile.userId,
      input.league,
      userProfile.oAuthToken
    );

    const divChaosValue =
      await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
        input.league,
        "divine orb"
      );
    const exChaosValue =
      await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
        input.league,
        "exalted orb"
      );

    const itemGroupSummaries: GqlStashSnapshotItemGroupSummary[] = [];
    const snapshot: StashSnapshot = {
      id: nanoid(),
      league: input.league,
      userId: input.userId,
      snapshotProfileId: profileId,
      createdAtTimestamp: new Date(),
      tags: [],
      totalValueChaos: 0,
      divineChaosValue: divChaosValue,
      exaltChaosValue: exChaosValue,
    };

    sw.start("fetch-tabs");
    for await (const tab of this.poeApi.fetchStashTabsWithRetry(
      userProfile.oAuthToken,
      input.poeStashTabIds,
      input.league
    )) {
      if (["MapStash", "UniqueStash"].includes(tab.type)) {
        Logger.debug("skipping sub stash tab");
      } else {
        try {
          const items = tab.items ?? [];
          for (const itemChunk of _.chunk(items, 300)) {
            for (const item of itemChunk) {
              const group: ItemGroupInfo =
                this.itemGroupingService.findOrCreateItemGroup(item);
              if (group) {
                let itemGroupSummary: GqlStashSnapshotItemGroupSummary =
                  itemGroupSummaries.filter(
                    (g) => g.itemGroupHashString === group.hashString
                  )?.[0];
                if (!itemGroupSummary) {
                  itemGroupSummary = {
                    userId: input.userId,
                    stashSnapshotId: snapshot.id,
                    createdAtTimestamp: new Date(),

                    league: input.league,

                    itemGroupHashString: group.hashString,
                    itemGroup: group as any,
                    quantity: 0,

                    valueChaos: 0,
                    totalValueChaos: 0,
                    stashLocations: [],
                  };
                  itemGroupSummaries.push(itemGroupSummary);
                }

                itemGroupSummary.quantity += item.stackSize ?? 1;
                const flatIndex = tabs.find((t) => t.id === tab.id)?.flatIndex;
                itemGroupSummary.stashLocations.push({
                  tabId: tab.id,
                  index: tab.index,
                  flatIndex,
                  name: tab.name,
                  x: item.x,
                  y: item.y,
                  quantity: item.stackSize ?? 1,
                });
              }
            }
          }
        } catch (err) {
          Logger.error("error during item read", err);
        }
      }
    }
    sw.stop("fetch-tabs");

    sw.start("inject-values");
    await this.itemValueHistoryService.injectItemPValue(
      itemGroupSummaries,
      input,
    );
    itemGroupSummaries.forEach(
      (i) => (snapshot.totalValueChaos += i.totalValueChaos)
    );
    sw.stop("inject-values");

    sw.start("write-entries");
    try {
      await this.postgresService.prisma.stashSnapshot.create({
        data: snapshot,
      });

      itemGroupSummaries.forEach((e) => delete e.itemGroup);
      await this.postgresService.prisma.stashSnapshotItemGroupSummary.createMany(
        {
          data: itemGroupSummaries as unknown as StashSnapshotItemGroupSummary[],
        }
      );
    } catch (error) {
      Logger.error("error in write-entries", error);
    }
    sw.stop("write-entries");

    Logger.info(
      `snapshot of ${
        input.poeStashTabIds.length
      } took ${sw.elapsedMS()} [fetch-tabs: ${sw.elapsedMS(
        "fetch-tabs"
      )} inject-values: ${sw.elapsedMS(
        "inject-values"
      )} write-entries: ${sw.elapsedMS("write-entries")}]`
    );
    return snapshot;
  }

  private buildVectors(
    itemGroupSummaries: GqlStashSnapshotItemGroupSummary[]
  ): unknown[][] {
    const vectors = [];

    for (const igs of itemGroupSummaries) {
      const stashLocations = igs.stashLocations.map((e) => [
        e.flatIndex,
        e.x,
        e.y,
        e.quantity,
      ]);
      const vector = [
        igs.itemGroupHashString,
        igs.quantity,
        igs.valueChaos,
        [
          igs.itemGroup.hashString,
          igs.itemGroup.properties,
          igs.itemGroup.tag,
          igs.itemGroup.key,
          igs.itemGroup.icon,
          igs.itemGroup.baseType,
          igs.itemGroup.displayName,
          igs.itemGroup.inventoryMaxStackSize,
        ],
        stashLocations,
      ];
      vectors.push(vector);
    }

    return vectors;
  }
}

import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { S3Service } from "./../s3-service";
import { UserService } from "./../user-service";

import { singleton } from "tsyringe";
import ItemGroupingService from "../pricing/item-grouping-service";
import _ from "lodash";
import LivePricingService from "../../services/live-pricing/live-pricing-service";
import { Logger } from "../logger";
import { PoeApiStashTab } from "@gql/resolvers-types";
import { nanoid } from "nanoid";
import { StashViewItemEntry } from "./stash-view-models";
import {
  StashViewTab,
  StashViewSnapshotGrouped as StashViewSnapshotTracked,
  StashViewSnapshotUntracked,
  StashViewUntrackedItemEntry,
  StashViewTrackedItemEntry,
  StashViewSnapshotHeader,
  StashViewSnapshotItemGroups,
} from "./stash-view-models";
import { UserProfile } from "@prisma/client";

@singleton()
export default class StashViewSnapshotService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly livePricingService: LivePricingService
  ) {}

  public async snapsnotInternal(ctx: StashViewSnapshotContext) {
    await this.loadInitialContext(ctx);
    await this.loadTabItems(ctx);
    await this.recordSnapshotAndCleanOldSnapshots(ctx);
    await this.uploadSnapshotToS3(ctx);
    await this.updateJob(ctx.jobId, `Complete.`);
  }

  private async loadInitialContext(ctx: StashViewSnapshotContext) {
    const config = ctx.config;

    ctx.tabs = await this.loadOrRefreshTabs(
      config.league,
      config.userOpaqueKey
    );

    ctx.snapshotHeader = {
      userId: config.userId,
      timestamp: ctx.timestamp,
    };

    const lastSnapshotRecord =
      await this.postgresService.prisma.stashViewSnapshotRecord.findFirst({
        where: { userId: config.userId, league: config.league },
        orderBy: { timestamp: "desc" },
      });

    const cachedStashViewSnapshotTracked: StashViewSnapshotTracked =
      await this.loadEntriesFromS3(
        ctx,
        lastSnapshotRecord?.timestamp,
        "tracked"
      );
    ctx.stashViewSnapshotTracked = {
      timestamp: ctx.timestamp,
      entriesByTab: {
        ...(cachedStashViewSnapshotTracked?.entriesByTab ?? {}),
      },
    };

    const cachedStashViewSnapshotUntracked: StashViewSnapshotUntracked =
      await this.loadEntriesFromS3(
        ctx,
        lastSnapshotRecord?.timestamp,
        "untracked"
      );
    ctx.stashViewSnapshotUntracked = {
      timestamp: ctx.timestamp,
      entriesByTab: {
        ...(cachedStashViewSnapshotUntracked?.entriesByTab ?? {}),
      },
    };
  }

  private async loadEntriesFromS3<T>(
    ctx: StashViewSnapshotContext,
    timestamp: Date | null,
    type: string
  ): Promise<T | null> {
    if (!timestamp) {
      return null;
    }

    const res: { entriesByTab: Record<string, StashViewItemEntry[]> } =
      await this.s3Service.getJson(
        "poe-stack-stash-view",
        `stash/${ctx.config.userOpaqueKey}/${ctx.config.league}/snapshots/${timestamp}/${type}.json`
      );

    if (!res?.entriesByTab) {
      return null;
    }

    for (const tabId of Object.keys(res.entriesByTab)) {
      if (!ctx.tabs?.find((e) => e.id === tabId)) {
        delete res.entriesByTab[tabId];
      }
    }

    return res as T;
  }

  private async loadTabItems(ctx: StashViewSnapshotContext) {
    await this.updateJob(ctx.jobId, "Fetching tabs.");

    const config = ctx.config;

    const tabIds = ctx.tabs
      .filter(
        (e) =>
          config.selectedTabIds.includes(e.id) &&
          !["MapStash", "UniqueStash"].includes(e.type)
      )
      .map((e) => e.id);
    const uniqStashTabIds = _.uniq(tabIds);

    let indexProgress = 0;
    await this.updateJob(
      ctx.jobId,
      `Fetching tab ${indexProgress}/${uniqStashTabIds.length}.`
    );

    const authToken = await this.userService.fetchUserOAuthTokenSafe(
      config.userId
    );

    for (const stashTabId of uniqStashTabIds) {
      await new Promise((res) => setTimeout(res, config.delayMs ?? 300));

      for (;;) {
        const { data: tab, rateLimitedForMs } = await this.poeApi.fetchStashTab(
          authToken,
          stashTabId,
          null,
          config.league
        );

        if (rateLimitedForMs) {
          Logger.info("stash fetch retry delaying " + rateLimitedForMs);
          await this.updateJob(
            ctx.jobId,
            `Tab ${indexProgress}/${uniqStashTabIds.length} waiting for GGG rate.`,
            new Date(Date.now() + rateLimitedForMs)
          );
          await new Promise((res) => setTimeout(res, rateLimitedForMs));
        } else {
          if (!tab) {
            break;
          }

          tab["userId"] = config.userId;
          tab["updatedAtTimestamp"] = ctx.timestamp;

          const untrackedItems: StashViewUntrackedItemEntry[] = [];
          const trackedItems: StashViewTrackedItemEntry[] = [];

          for (const item of tab.items) {
            const group = this.itemGroupingService.findOrCreateItemGroup(item);
            if (group) {
              trackedItems.push({
                x: item.x,
                y: item.y,
                quantity: item.stackSize ?? 1,
                itemGroupHashString: group.hashString,
                value: 0,
                fixedValue: 0,
                stockValue: 0,
                valueChaos: 0,
                totalValueChaos: 0,
              });
            } else {
              untrackedItems.push({
                x: item.x,
                y: item.y,
                quantity: item.stackSize ?? 1,
                searchableString: [item.name, item.typeLine ?? item.baseType]
                  .filter((e) => !!e)
                  .join(" "),
                icon: item.icon,
              });
            }
          }

          await this.updateJob(
            ctx.jobId,
            `Writing tab ${indexProgress}/${tabIds.length}.`
          );

          await this.livePricingService.injectPrices(trackedItems, {
            league: config.league,
            listingPercent: 10,
          });

          await this.s3Service.putJson(
            "poe-stack-stash-view",
            `stash/${config.userOpaqueKey}/${config.league}/tabs/${tab.id}.json`,
            tab
          );

          ctx.stashViewSnapshotTracked.entriesByTab[tab.id] = trackedItems;
          ctx.stashViewSnapshotUntracked.entriesByTab[tab.id] = untrackedItems;

          const stashTotalFixedValue = trackedItems.reduce(
            (p, c) => p + c.fixedValue * c.quantity,
            0
          );
          await this.postgresService.prisma.stashViewValueSnapshot.create({
            data: {
              id: nanoid(),
              userId: config.userId,
              league: config.league,
              stashId: stashTabId,
              timestamp: ctx.timestamp,
              value: stashTotalFixedValue,
            },
          });

          indexProgress++;
          await this.updateJob(
            ctx.jobId,
            `Fetching tab ${indexProgress}/${tabIds.length}.`
          );
        }

        break;
      }
    }
  }

  private async uploadSnapshotToS3(ctx: StashViewSnapshotContext) {
    const config = ctx.config;

    await this.s3Service.putJson(
      "poe-stack-stash-view",
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${ctx.timestamp}/header.json`,
      ctx.snapshotHeader
    );
    await this.s3Service.putJson(
      "poe-stack-stash-view",
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${ctx.timestamp}/tracked.json`,
      ctx.stashViewSnapshotTracked
    );
    await this.s3Service.putJson(
      "poe-stack-stash-view",
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${ctx.timestamp}/untracked.json`,
      ctx.stashViewSnapshotUntracked
    );

    const uniqItemGroupIds = _.uniq(
      Object.values(ctx.stashViewSnapshotTracked.entriesByTab)
        .flatMap((e) => e)
        .map((e) => e.itemGroupHashString)
    ).filter((e) => !!e);
    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      { where: { hashString: { in: uniqItemGroupIds } } }
    );
    const itemGroupMap = {};
    itemGroups.forEach((e) => (itemGroupMap[e.hashString] = e));
    const stashViewSnapshotItemGroups: StashViewSnapshotItemGroups = {
      timestamp: ctx.timestamp,
      itemGroups: Object.values(itemGroupMap),
    };
    await this.s3Service.putJson(
      "poe-stack-stash-view",
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${ctx.timestamp}/item_groups.json`,
      stashViewSnapshotItemGroups
    );
  }

  private async recordSnapshotAndCleanOldSnapshots(
    ctx: StashViewSnapshotContext
  ) {
    const config = ctx.config;
    await this.postgresService.prisma.stashViewSnapshotRecord.create({
      data: {
        league: config.league,
        userId: config.userId,
        timestamp: ctx.timestamp,
        favorited: false,
      },
    });

    let nonfavoritedSnapshotCount =
      await this.postgresService.prisma.stashViewSnapshotRecord.count({
        where: {
          userId: config.userId,
          league: config.league,
          favorited: false,
        },
      });

    const userSnapshotLimit =
      SNAPSHOT_LIMITS_BY_PATREON_TIER[ctx.user.patreonTier] ?? 3;

    while (nonfavoritedSnapshotCount > userSnapshotLimit) {
      const oldestNonfavoritedSnapshot =
        await this.postgresService.prisma.stashViewSnapshotRecord.findFirst({
          where: { userId: config.userId, league: config.league },
          orderBy: { timestamp: "asc" },
        });
      await this.deleteSnapshot({
        userId: ctx.user.userId,
        userOpaqueKey: ctx.user.opaqueKey,
        league: config.league,
        timestamp: oldestNonfavoritedSnapshot.timestamp,
      });
      nonfavoritedSnapshotCount--;
    }
  }

  public async deleteSnapshot(config: {
    userId: string;
    userOpaqueKey: string;
    league: string;
    timestamp: Date;
  }) {
    const keys = [
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${config.timestamp}/item_groups.json`,
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${config.timestamp}/untracked.json`,
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${config.timestamp}/tracked.json`,
      `stash/${config.userOpaqueKey}/${config.league}/snapshots/${config.timestamp}/header.json`,
    ];

    for (const key of keys) {
      await this.s3Service.deleteItem("poe-stack-stash-view", key);
    }

    await this.postgresService.prisma.stashViewSnapshotRecord.delete({
      where: {
        userId_league_timestamp: {
          userId: config.userId,
          league: config.league,
          timestamp: config.timestamp,
        },
      },
    });
  }

  public async takeSnapshot(config: StashViewSnapshotConfig): Promise<string> {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { userId: config.userId } }
    );
    const ctx: StashViewSnapshotContext = {
      config: config,
      user: user,
      jobId: `manual__${nanoid()}`,
      timestamp: new Date(),
    };

    await this.postgresService.prisma.stashViewSnapshotJob.create({
      data: {
        id: ctx.jobId,
        userId: ctx.config.userId,
        timestamp: new Date(),
        status: "Starting",
      },
    });
    this.snapsnotInternal(ctx);
    return ctx.jobId;
  }

  public async loadOrRefreshTabs(
    league: string,
    userOpaqueKey: string,
    forceRefresh = false
  ): Promise<StashViewTab[] | null> {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { opaqueKey: userOpaqueKey } }
    );

    const s3Path = `stash/${userOpaqueKey}/${league}/tabs.json`;
    if (!forceRefresh) {
      const cachedTabsSummary: {
        updatedAtTimestamp: Date;
        tabs: StashViewTab[];
      } = await this.s3Service.getJson("poe-stack-stash-view", s3Path);
      if (
        cachedTabsSummary?.updatedAtTimestamp &&
        Date.now() - new Date(cachedTabsSummary.updatedAtTimestamp).getTime() <
          1000 * 60 * 10
      ) {
        return cachedTabsSummary.tabs;
      }
    }

    const { data: rawStashTabs } = await this.poeApi.fetchStashTabs(
      user.oAuthToken,
      league
    );
    if (rawStashTabs) {
      const flatStashTabs: PoeApiStashTab[] = rawStashTabs.flatMap(
        (stashTab) => {
          const res: PoeApiStashTab[] = stashTab.children
            ? stashTab.children
            : [stashTab];
          delete stashTab.children;
          return res;
        }
      );
      const mappedTabs: StashViewTab[] = flatStashTabs.map((tab, i) => ({
        id: tab.id,
        parent: tab.parent,
        color: tab?.metadata?.colour,
        folder: tab?.metadata?.folder,
        name: tab.name,
        type: tab.type,
        index: tab.index,
        flatIndex: i,
      }));

      await this.s3Service.putJson("poe-stack-stash-view", s3Path, {
        tabs: mappedTabs,
        updatedAtTimestamp: new Date(),
      });

      return mappedTabs;
    }

    return null;
  }

  private async updateJob(
    jobId: string,
    status: string,
    rateLimitEndTimestamp: Date | null = null
  ) {
    await this.postgresService.prisma.stashViewSnapshotJob.update({
      where: { id: jobId },
      data: { status: status, rateLimitEndTimestamp: rateLimitEndTimestamp },
    });
  }

  public async startAutomaticSnapshotJob() {
    for (;;) {
      await new Promise((res) => setTimeout(res, 1000 * 30));
      try {
        const snapshotJobs =
          await this.postgresService.prisma.stashViewAutomaticSnapshotSettings.findMany(
            {
              where: {
                nextSnapshotTimestamp: { lte: new Date() },
                stashIds: { isEmpty: false },
              },
            }
          );

        for (const job of snapshotJobs) {
          try {
            const jobId = `automatic__${nanoid()}`;
            await this.postgresService.prisma.stashViewSnapshotJob.create({
              data: {
                id: jobId,
                userId: job.userId,
                timestamp: new Date(),
                status: "starting",
              },
            });

            await this.postgresService.prisma.stashViewAutomaticSnapshotSettings.update(
              {
                where: {
                  userId_league: { userId: job.userId, league: job.league },
                },
                data: {
                  nextSnapshotTimestamp: new Date(
                    Date.now() + job.durationBetweenSnapshotsSeconds * 1000
                  ),
                },
              }
            );

            const user =
              await this.postgresService.prisma.userProfile.findFirstOrThrow({
                where: { userId: job.userId },
              });

            await this.snapsnotInternal({
              jobId: jobId,
              timestamp: new Date(),
              user: user,
              config: {
                userId: user.userId,
                userOpaqueKey: user.opaqueKey,
                league: job.league,
                selectedTabIds: job.stashIds,
                delayMs: 1000,
              },
            });
          } catch (error) {
            Logger.error("error in automatic stash snapshot job", job, error);
          }
        }
      } catch (error) {
        Logger.error("error in automatic stash snapshot job", error);
      }
    }
  }
}

//Default 3
export const SNAPSHOT_LIMITS_BY_PATREON_TIER = {
  Bronze: 6,
  Silver: 12,
  Gold: 24,
};

//Default 1
export const SNAPSHOT_FAVORITE_LIMITS_BY_PATREON_TIER = {
  Bronze: 3,
  Silver: 6,
  Gold: 12,
};

export interface StashViewSnapshotContext {
  config: StashViewSnapshotConfig;
  jobId: string;
  timestamp: Date;

  user: UserProfile;

  tabs?: StashViewTab[];

  snapshotHeader?: StashViewSnapshotHeader;
  stashViewSnapshotTracked?: StashViewSnapshotTracked;
  stashViewSnapshotUntracked?: StashViewSnapshotUntracked;
}

export interface StashViewSnapshotConfig {
  userId: string;
  userOpaqueKey: string;
  league: string;
  selectedTabIds: string[];
  delayMs?: number;
}
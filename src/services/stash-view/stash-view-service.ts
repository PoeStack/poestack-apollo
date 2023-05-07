import { STASH_VIEW_TFT_CATEGORIES } from "./stash-view-tft-categories";

import { Logger } from "./../logger";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { S3Service } from "./../s3-service";
import { UserService } from "./../user-service";

import { singleton } from "tsyringe";
import { OneClickMessageHistory, StashViewItemSummary } from "@prisma/client";
import ItemGroupingService from "../pricing/item-grouping-service";
import ItemValueHistoryService from "../pricing/item-value-history-service";
import {
  GqlPoeStashTab,
  GqlStashViewSettings,
  GqlStashViewStashSummary,
  GqlStashViewStashSummarySearch,
} from "../../models/basic-models";
import { nanoid } from "nanoid";
import _ from "lodash";
import TftOneClickService from "../../services/tft/tft-one-click-service";
import { PoeApiStashTab } from "@gql/resolvers-types";
import { GeneralUtils } from "../../utils/general-util";
import LivePricingService from "../../services/live-pricing/live-pricing-service";

@singleton()
export default class StashViewService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly tftOneClickService: TftOneClickService,
    private readonly livePricingService: LivePricingService
  ) {}

  public async updateTabs(league: string, userOpaqueKey: string) {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { opaqueKey: userOpaqueKey } }
    );

    const { data: rawStashTabs, rateLimitedForMs } =
      await this.poeApi.fetchStashTabs(user.oAuthToken, league);

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
      const mappedTabs: any[] = flatStashTabs.map((tab, i) => ({
        id: tab.id,
        parent: tab.parent,
        color: tab?.metadata?.colour,
        folder: tab?.metadata?.folder,
        name: tab.name,
        type: tab.type,
        index: tab.index,
        flatIndex: i,
      }));

      await this.s3Service.putJson(
        "poe-stack-stash-view",
        `stash/${userOpaqueKey}/${league}/tabs.json`,
        { tabs: mappedTabs, updatedAtTimestamp: new Date() }
      );
    }
  }

  public async updateTabsInternal(
    jobId: string,
    userId: string,
    userOpaqueKey: string,
    league: string,
    initialTabs: string[],
    delayMs: number
  ) {
    const now = new Date();

    if (GeneralUtils.random(0, 10) === 5) {
      await this.updateTabs(league, userOpaqueKey);
    }

    const cachedStashSummary =
      (await this.s3Service.getJson(
        "poe-stack-stash-view",
        `stash/${userOpaqueKey}/${league}/summary.json`
      )) ?? {};

    const stashSummary: {
      updatedAtTimestamp: Date;
      tabs: Record<
        string,
        {
          stashTotalValue: number;
          updatedAtTimestamp: Date;
          itemSummaries: StashViewItemSummary[];
        }
      >;
    } = {
      tabs: { ...(cachedStashSummary?.tabs ?? {}) },
      updatedAtTimestamp: now,
    };

    let indexProgress = 0;

    await this.updateJob(jobId, "Fetching token.");
    const authToken = await this.userService.fetchUserOAuthTokenSafe(userId);

    await this.updateJob(jobId, "Fetching tabs.");
    const tabs = await this.postgresService.prisma.poeStashTab.findMany({
      where: { userId: userId, league: league, id: { in: initialTabs } },
      select: { type: true, id: true },
    });

    const tabIds = tabs
      .filter((e) => !["MapStash", "UniqueStash"].includes(e.type))
      .map((e) => e.id);

    await this.updateJob(
      jobId,
      `Fetching tab ${indexProgress}/${tabIds.length}.`
    );
    const uniqStashTabIds = _.uniq(tabIds);
    for (const stashTabId of uniqStashTabIds) {
      await new Promise((res) => setTimeout(res, delayMs));

      while (true) {
        const { data: tab, rateLimitedForMs } = await this.poeApi.fetchStashTab(
          authToken,
          stashTabId,
          null,
          league
        );

        if (rateLimitedForMs) {
          Logger.info("stash fetch retry delaying " + rateLimitedForMs);
          await this.updateJob(
            jobId,

            `Tab ${indexProgress}/${
              tabIds.length
            } waiting for GGG rate limit ${Math.round(
              rateLimitedForMs / 1000
            )} seconds.`
          );
          await new Promise((res) => setTimeout(res, rateLimitedForMs));
        } else {
          if (!tab) {
            break;
          }

          tab["userId"] = userId;
          tab["updatedAtTimestamp"] = now;

          const itemSummariesToWrite: StashViewItemSummary[] = [];
          for (const item of tab.items) {
            const group = this.itemGroupingService.findOrCreateItemGroup(item);

            item["itemGroupHashString"] = group?.hashString;
            item["itemGroupTag"] = group?.tag;

            const searchableString = group
              ? group.key
              : [item.name, item.typeLine ?? item.baseType]
                  .filter((e) => !!e)
                  .join(" ");

            const splitIcon = item.icon
              ?.replace("https://web.poecdn.com/gen/image/", "")
              ?.split("/");
            const summary: StashViewItemSummary = {
              itemId: item.id,
              userId: userId,
              league: league,
              stashId: tab.id,
              x: item.x,
              y: item.y,
              quantity: item.stackSize ?? 1,
              searchableString: searchableString.toLowerCase(),
              itemGroupHashString: group?.hashString,
              itemGroupTag: group?.tag,
              icon: item.icon,
              category: [],
              iconId: splitIcon?.[1],
            };

            if (item.icon) {
              const data = JSON.parse(
                Buffer.from(
                  item.icon
                    .replace("https://web.poecdn.com/gen/image/", "")
                    .split("/")[0],
                  "base64"
                ).toString()
              );

              summary.category = data[2].f.split("/");
            }

            itemSummariesToWrite.push(summary);
          }

          await this.updateJob(
            jobId,
            `Writing tab ${indexProgress}/${tabIds.length}.`
          );

          try {
            await this.livePricingService.injectPrices(itemSummariesToWrite, {
              league: league,
              targetPValuePercent: 10,
            });
          } catch (error) {
            Logger.info("live pricing inject", { error: error});
          }

          await this.itemValueHistoryService.injectItemPValue(
            itemSummariesToWrite,
            {
              league: league,
              valuationTargetPValue: "p10",
              valuationStockInfluence: "none",
            }
          );

          const stashTotalValue = _.sumBy(
            itemSummariesToWrite,
            (e) => e["totalValueChaos"] ?? 0
          );

          tab["totalValueChaos"] = stashTotalValue;
          await this.s3Service.putJson(
            "poe-stack-stash-view",
            `stash/${userOpaqueKey}/${league}/tabs/${tab.id}.json`,
            tab
          );

          stashSummary.tabs[tab.id] = {
            stashTotalValue: stashTotalValue,
            itemSummaries: itemSummariesToWrite,
            updatedAtTimestamp: now,
          };

          await this.postgresService.prisma.stashViewValueSnapshot.create({
            data: {
              id: nanoid(),
              userId: userId,
              league: league,
              stashId: stashTabId,
              timestamp: now,
              value: stashTotalValue,
            },
          });

          await this.postgresService.prisma.stashViewTabSnapshotRecord.upsert({
            where: {
              userId_league_stashId: {
                league: league,
                stashId: tab.id,
                userId: userId,
              },
            },
            create: {
              league: league,
              stashId: tab.id,
              userId: userId,
              timestamp: now,
            },
            update: { timestamp: now },
          });

          indexProgress++;
          await this.updateJob(
            jobId,
            `Fetching tab ${indexProgress}/${tabIds.length}.`
          );
        }

        break;
      }
    }

    await this.s3Service.putJson(
      "poe-stack-stash-view",
      `stash/${userOpaqueKey}/${league}/summary.json`,
      stashSummary
    );

    const uniqItemGroupIds = _.uniq(
      Object.values(stashSummary.tabs)
        .flatMap((e) => e.itemSummaries)
        .map((e) => e.itemGroupHashString)
    ).filter((e) => !!e);
    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      { where: { hashString: { in: uniqItemGroupIds } } }
    );
    const itemGroupMap = {};
    itemGroups.forEach((e) => (itemGroupMap[e.hashString] = e));
    await this.s3Service.putJson(
      "poe-stack-stash-view",
      `stash/${userOpaqueKey}/${league}/summary_item_groups.json`,
      { itemGroups: itemGroupMap, updatedAtTimestamp: now }
    );

    await this.updateJob(jobId, `Complete.`);
  }

  private async updateJob(jobId: string, status: string) {
    await this.postgresService.prisma.stashViewSnapshotJob.update({
      where: { id: jobId },
      data: { status: status },
    });
  }

  public async takeSnapshot(
    userId: string,
    userOpaqueKey: string,
    league: string,
    tabIds: string[]
  ): Promise<string> {
    const jobId = `manual__${nanoid()}`;
    await this.postgresService.prisma.stashViewSnapshotJob.create({
      data: {
        id: jobId,
        userId: userId,
        timestamp: new Date(),
        totalStahes: tabIds.length,
        status: "starting",
      },
    });
    this.updateTabsInternal(jobId, userId, userOpaqueKey, league, tabIds, 300);
    return jobId;
  }
  "874662778592460851";

  public async oneClickPostMessage(
    opaqueKey: string,
    input: GqlStashViewSettings
  ): Promise<string> {
    input.selectedExporter = "TFT-Bulk";
    const tftCategory = STASH_VIEW_TFT_CATEGORIES[input.tftSelectedCategory];
    input.checkedTags = tftCategory!.tags;

    if (!tftCategory.enableOverrides && input.valueOverridesEnabled) {
      throw new Error("Overrides cannot be used in this channel.");
    }
    if (!tftCategory.enableOverrides) {
      input.valueOverridesEnabled = false;
    }

    const summary = await this.fetchStashViewTabSummary(opaqueKey, {
      league: input.league,
    });

    const listingBody: string = tftCategory.export(summary, null, input);
    return listingBody;
  }

  public async oneClickPost(userId: string, input: GqlStashViewSettings) {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { userId: userId } }
    );
    const listingBody: string = await this.oneClickPostMessage(
      user.opaqueKey,
      input
    );

    const tftCategory = STASH_VIEW_TFT_CATEGORIES[input.tftSelectedCategory];
    const targetChannel = tftCategory.channels[input.league];
    const resp = await this.tftOneClickService.postOneClickMesage(
      targetChannel.channelId,
      targetChannel.timeout,
      {
        discordUserId: user.discordUserId,
        discordUsername: user.discordUsername,
        poeAccountProfileName: user.poeProfileName,
        poeAccountId: user.userId,
        league: input.league,
        messageBody: listingBody,
        imageUrl: !targetChannel.disableImages
          ? `https://octopus-app-tw5um.ondigitalocean.app/api/stash-view/tft-export-image?input=${encodeURIComponent(
              JSON.stringify(input)
            )}&opaqueKey=${user.opaqueKey}`
          : null,
        test: false,
      }
    );

    if (resp?.messageId) {
      Logger.info("sent tft-one-click", {
        userId: userId,
        tftSelectedCategory: input.tftSelectedCategory,
      });
    }

    const listingHistory: OneClickMessageHistory = {
      messageId: resp.messageId,
      userId: userId,
      channelId: targetChannel.channelId,
      exportType: input.tftSelectedCategory,
      exportSubType: null,
      rateLimitExpires: new Date(
        new Date().getTime() + targetChannel.timeout * 1000
      ),
      timestamp: new Date(),
    };
    await this.postgresService.prisma.oneClickMessageHistory.create({
      data: listingHistory,
    });

    return listingBody;
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
                totalStahes: job.stashIds.length,
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

            await this.updateTabsInternal(
              jobId,
              user.userId,
              user.opaqueKey,
              job.league,
              job.stashIds,
              1000
            );
          } catch (error) {
            Logger.error("error in automatic stash snapshot job", job, error);
          }
        }
      } catch (error) {
        Logger.error("error in automatic stash snapshot job", error);
      }
    }
  }

  public async fetchStashViewTabSummary(
    opaqueKey: string,
    search: GqlStashViewStashSummarySearch
  ): Promise<GqlStashViewStashSummary> {
    const summaryJson = await this.s3Service.getJson(
      "poe-stack-stash-view",
      `stash/${opaqueKey}/${search.league}/summary.json`
    );
    const itemGroupsJson = await this.s3Service.getJson(
      "poe-stack-stash-view",
      `stash/${opaqueKey}/${search.league}/summary_item_groups.json`
    );

    const items: any[] = Object.values(summaryJson?.tabs ?? {}).flatMap(
      (e: any) => e.itemSummaries
    );
    const mapping = {
      itemGroups: Object.values(itemGroupsJson.itemGroups),
      items: items.map((e) => ({
        ...e,
        league: search.league,
        itemGroup: e.itemGroupHashString
          ? itemGroupsJson.itemGroups[e.itemGroupHashString]
          : null,
      })),
    };

    return mapping as GqlStashViewStashSummary;
  }
}

import { STASH_VIEW_TFT_CATEGORIES } from "./stash-view-tft-categories";

import { StashViewExporters } from "./stash-view-exporters";
import { Logger } from "./../logger";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { S3Service } from "./../s3-service";
import { UserService } from "./../user-service";

import { singleton } from "tsyringe";
import { StashViewItemSummary } from "@prisma/client";
import ItemGroupingService from "../pricing/item-grouping-service";
import ItemValueHistoryService from "../pricing/item-value-history-service";
import {
  GqlItemGroup,
  GqlStashViewItemSummary,
  GqlStashViewSettings,
  GqlStashViewStashSummary,
  GqlStashViewStashSummarySearch,
} from "../../models/basic-models";
import { nanoid } from "nanoid";
import _ from "lodash";
import TftOneClickService from "../../services/tft/tft-one-click-service";

@singleton()
export default class StashViewService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly tftOneClickService: TftOneClickService
  ) {}

  public async updateTabsInternal(
    jobId: string,
    userId: string,
    league: string,
    initialTabs: string[]
  ) {
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
          tab["updatedAtTimestamp"] = new Date();

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

          await this.itemValueHistoryService.injectItemPValue(
            itemSummariesToWrite,
            {
              league: league,
              valuationTargetPValue: "p10",
              valuationStockInfluence: "smart-influence",
            }
          );

          const stashTotalValue = _.sumBy(
            itemSummariesToWrite,
            (e) => e["totalValueChaos"] ?? 0
          );

          tab["totalValueChaos"] = stashTotalValue;
          await this.s3Service.putJson(
            "poe-stack-stash-view",
            `tabs/${userId}/${league}/${tab.id}.json`,
            tab
          );

          await this.postgresService.prisma.stashViewValueSnapshot.create({
            data: {
              id: nanoid(),
              userId: userId,
              league: league,
              stashId: stashTabId,
              timestamp: new Date(),
              value: stashTotalValue,
            },
          });
          itemSummariesToWrite.forEach((e) => {
            delete e["valueChaos"];
            delete e["totalValueChaos"];
          });

          await this.s3Service.putJson(
            "poe-stack-stash-view",
            `tabs/${userId}/${league}/${tab.id}_summary.json`,
            { itemSummaries: itemSummariesToWrite }
          );
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
              timestamp: new Date(),
            },
            update: { timestamp: new Date() },
          });

          /* await this.postgresService.prisma.stashViewItemSummary.deleteMany({
            where: { userId: userId, stashId: tab.id },
          });
          await this.postgresService.prisma.stashViewItemSummary.createMany({
            data: itemSummariesToWrite,
          }); */

          indexProgress++;
          await this.updateJob(
            jobId,
            `Fetching tab ${indexProgress}/${tabIds.length}.`
          );
        }

        break;
      }
    }

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
    league: string,
    tabIds: string[]
  ): Promise<string> {
    const jobId = nanoid();
    await this.postgresService.prisma.stashViewSnapshotJob.create({
      data: {
        id: jobId,
        userId: userId,
        timestamp: new Date(),
        totalStahes: tabIds.length,
        status: "starting",
      },
    });
    this.updateTabsInternal(jobId, userId, league, tabIds);
    return jobId;
  }

  public async oneClickPost(userId: string, input: GqlStashViewSettings) {
    input.selectedExporter = "TFT-Bulk";
    const tftCategory = STASH_VIEW_TFT_CATEGORIES[input.tftSelectedCategory];
    input.checkedTags = tftCategory!.tags;

    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { userId: userId } }
    );

    const summary = await this.fetchStashViewTabSummary(userId, {
      league: input.league,
    });

    const listingBody: string = tftCategory.export(summary, null, input);

    const targetChannel = tftCategory.channels[input.league];
    await this.tftOneClickService.createBulkListing2(
      targetChannel.channelId,
      targetChannel.timeout,
      {
        discordUserId: user.discordUserId,
        poeAccountProfileName: user.poeProfileName,
        poeAccountId: user.userId,
        league: input.league,
        messageBody: listingBody,
        imageUrl: !targetChannel.disableImages
          ? `https://octopus-app-tw5um.ondigitalocean.app/api/stash-view/tft-export-image?input=${encodeURIComponent(
              JSON.stringify(input)
            )}`
          : null,
        test: false,
      }
    );

    return listingBody;
  }

  public async fetchStashViewTabSummary(
    appliedUserId: string,
    search: GqlStashViewStashSummarySearch,
    mappItemGroups: boolean = true
  ): Promise<GqlStashViewStashSummary> {
    const validTabs =
      await this.postgresService.prisma.stashViewTabSnapshotRecord.findMany({
        where: { userId: appliedUserId, league: search.league },
      });

    const s3Promises = validTabs.map(async (tab) => {
      const snapshot = await this.s3Service.getJson(
        "poe-stack-stash-view",
        `tabs/${appliedUserId}/${search.league}/${tab.stashId}_summary.json`
      );
      return snapshot?.itemSummaries;
    });

    const items = (await Promise.all(s3Promises)).flatMap((e) => e);

    await this.itemValueHistoryService.injectItemPValue(items, {
      league: search.league,
      valuationStockInfluence: "smart-influnce",
      valuationTargetPValue: "p10",
    });

    const uniqItemGroupIds = _.uniq(
      items.map((e) => e.itemGroupHashString)
    ).filter((e) => !!e);
    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      { where: { hashString: { in: uniqItemGroupIds } } }
    );

    if (mappItemGroups) {
      (items as GqlStashViewItemSummary[]).forEach((e) => {
        if (e.itemGroupHashString) {
          e.itemGroup = (itemGroups as unknown as GqlItemGroup[]).find(
            (g) => g.hashString === e.itemGroupHashString
          );
        }
      });
    }

    return {
      items: items,
      itemGroups: itemGroups as unknown as GqlItemGroup[],
    };
  }
}

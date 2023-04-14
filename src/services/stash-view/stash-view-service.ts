import { Logger } from "./../logger";
import { PoeApiStashTab } from "@gql/resolvers-types";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { S3Service } from "./../s3-service";
import { UserService } from "./../user-service";

import { singleton } from "tsyringe";
import NodeCache from "node-cache";
import { StashViewItemSummary } from "@prisma/client";
import ItemGroupingService from "../pricing/item-grouping-service";
import ItemValueHistoryService from "../pricing/item-value-history-service";
import { GqlStashViewItemSummary } from "../../models/basic-models";
import { nanoid } from "nanoid";
import _ from "lodash";

@singleton()
export default class StashViewService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly itemValueHistoryService: ItemValueHistoryService
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

          await this.s3Service.putJson(
            "poe-stack-stash-view",
            `tabs/${userId}/${league}/${tab.id}.json`,
            tab
          );

          const itemSummariesToWrite: StashViewItemSummary[] = [];
          for (const item of tab.items) {
            const group = this.itemGroupingService.findOrCreateItemGroup(item);

            const searchableString = group
              ? group.key
              : [item.name, item.typeLine ?? item.baseType]
                  .filter((e) => !!e)
                  .join(" ");

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
            };
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

          await this.postgresService.prisma.stashViewItemSummary.deleteMany({
            where: { userId: userId, stashId: tab.id },
          });
          await this.postgresService.prisma.stashViewItemSummary.createMany({
            data: itemSummariesToWrite,
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

  public async fetchItemSummaries(
    userId: string,
    league: string
  ): Promise<GqlStashViewItemSummary[]> {
    const items =
      await this.postgresService.prisma.stashViewItemSummary.findMany({
        where: { userId: userId, league: league },
      });

    await this.itemValueHistoryService.injectItemPValue(items, {
      league: league,
      valuationStockInfluence: "smart-influnce",
      valuationTargetPValue: "p10",
    });

    return items;
  }

  public async test() {
    const userId = "d3d595b6-6982-48f9-9358-048292beb8a7";
    const league = "Crucible";

    const tabs = await this.postgresService.prisma.poeStashTab.findMany({
      where: { userId: userId, league: league },
      select: { type: true, id: true },
    });

    await this.takeSnapshot(
      userId,
      league,
      tabs.map((e) => e.id)
    );

    Logger.info("asdasd");
  }
}

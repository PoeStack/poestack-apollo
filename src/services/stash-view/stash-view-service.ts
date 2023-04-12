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

  public async updateAllTabs(userId: string, league: string) {
    const authToken = await this.userService.fetchUserOAuthTokenSafe(userId);

    const tabs = await this.postgresService.prisma.poeStashTab.findMany({
      where: { userId: userId, league: league },
      select: { type: true, id: true },
    });

    const tabIds = tabs
      .filter((e) => !["MapStash", "UniqueStash"].includes(e.type))
      .map((e) => e.id);

    for await (const tab of this.poeApi.fetchStashTabsWithRetry(
      authToken,
      tabIds,
      league
    )) {
      if (!tab) {
        continue;
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
        };
        itemSummariesToWrite.push(summary);
      }

      await this.postgresService.prisma.stashViewItemSummary.deleteMany({
        where: { userId: userId, stashId: tab.id },
      });
      await this.postgresService.prisma.stashViewItemSummary.createMany({
        data: itemSummariesToWrite,
      });
    }
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

    await this.updateAllTabs(userId, league);

    Logger.info("asdasd");
  }
}

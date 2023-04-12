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

@singleton()
export default class StashViewService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly itemGroupingService: ItemGroupingService
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

    const itemSummariesToWrite: StashViewItemSummary[] = [];
    for await (const tab of this.poeApi.fetchStashTabsWithRetry(
      authToken,
      tabIds,
      league
    )) {
      tab["userId"] = userId;
      tab["updatedAtTimestamp"] = new Date();

      await this.s3Service.putJson(
        "poe-stack-stash-view",
        `tabs/${userId}/${league}/${tab.id}.json`,
        tab
      );

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
          stackSize: item.stackSize ?? 1,
          searchableString: searchableString,
          itemGroupHashString: group?.hashString,
          itemGroupTag: group?.tag,
        };
        itemSummariesToWrite.push(summary);
      }
    }

    await this.postgresService.prisma.stashViewItemSummary.deleteMany({
      where: { userId: userId, stashId: { in: tabIds } },
    });
    await this.postgresService.prisma.stashViewItemSummary.createMany({
      data: itemSummariesToWrite,
    });
  }

  public async test() {
    const userId = "d3d595b6-6982-48f9-9358-048292beb8a7";
    const league = "Crucible";

    await this.updateAllTabs(userId, league);

    Logger.info("asdasd");
  }
}

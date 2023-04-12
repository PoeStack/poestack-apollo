import { Logger } from "./../logger";
import { PoeApiStashTab } from "@gql/resolvers-types";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { S3Service } from "./../s3-service";
import { UserService } from "./../user-service";

import { singleton } from "tsyringe";
import NodeCache from "node-cache";

@singleton()
export default class StashViewService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service
  ) {}

  private async updateStashTabs(userId: string, league: string) {
    const authToken = await this.userService.fetchUserOAuthTokenSafe(userId);

    const { data: stashTabs } = await this.poeApi.fetchStashTabs(
      authToken,
      league
    );
    if (!stashTabs) {
      throw new Error("Failed to load stash tabs.");
    }

    const flatStashTabs: PoeApiStashTab[] = stashTabs.flatMap((stashTab) => {
      const res: PoeApiStashTab[] = stashTab.children
        ? stashTab.children
        : [stashTab];
      delete stashTab.children;
      return res;
    });

    let flatIndex = 0;
    for (const tab of flatStashTabs) {
      await this.postgresService.prisma.stashViewTabSummary.upsert({
        where: {
          userId_stashId_league: {
            stashId: tab.id,
            userId: userId,
            league: league,
          },
        },
        create: {
          league: league,
          userId: userId,
          stashId: tab.id,
          createdAtTimestamp: new Date(),
          updatedAtTimestamp: new Date(),
          index: tab.index,
          flatIndex: flatIndex,
          color: tab.metadata?.colour,
          name: tab.name,
          type: tab.type,
        },
        update: {
          updatedAtTimestamp: new Date(),
          color: tab.metadata?.colour,
          name: tab.name,
          type: tab.type,
          index: tab.index,
          flatIndex: flatIndex,
        },
      });

      flatIndex++;
    }
  }

  public async updateAllTabs(userId: string, league: string) {
    const authToken = await this.userService.fetchUserOAuthTokenSafe(userId);

    const tabs = await this.postgresService.prisma.stashViewTabSummary.findMany(
      {
        where: { userId: userId, league: league },
        select: { type: true, stashId: true },
      }
    );

    for await (const tab of this.poeApi.fetchStashTabsWithRetry(
      authToken,
      tabs
        .filter((e) => !["MapStash", "UniqueStash"].includes(e.type))
        .map((e) => e.stashId),
      league
    )) {
      tab['userId'] = userId;
      tab['updatedAtTimestamp'] = new Date();

      await this.s3Service.putJson(
        "poe-stack-stash-view",
        `tabs/${userId}/${league}/${tab.id}.json`,
        tab
      );

      Logger.info("asdasd");
    }
  }

  public async test() {
    const userId = "d3d595b6-6982-48f9-9358-048292beb8a7";
    const league = "Crucible";

    //await this.updateStashTabs(userId, league);

    //await this.updateAllTabs(userId, league);

    Logger.info("asdasd");
  }
}

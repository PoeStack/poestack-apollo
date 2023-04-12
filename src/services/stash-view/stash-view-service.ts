import { Logger } from "./../logger";
import { GqlStashViewOverview } from "./../../models/basic-models";
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
          color: tab.metadata.colour,
          folder: tab.parent,
          name: tab.name,
          type: tab.type,
          summary: null,
        },
        update: {
          updatedAtTimestamp: new Date(),
          color: tab.metadata.colour,
          folder: tab.parent,
          name: tab.name,
          type: tab.type,
        },
      });

      flatIndex++;
    }
  }

  public async test() {
/*     const userId = "d3d595b6-6982-48f9-9358-048292beb8a7";
    const league = "Crucible";

    if (
      new Date().getTime() -
        new Date(overview.poeStashTabsUpdatedAtTimestamp).getTime() >
      1000 * 60 * 10
    ) {
      await this.updateStashTabs(overview);
    }

    const tabsToUpdate = overview.poeStashTabs.filter((e) =>
      e.name.startsWith("D-")
    );

    Logger.info("asdasd"); */
  }
}

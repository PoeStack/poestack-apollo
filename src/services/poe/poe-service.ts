import { singleton } from "tsyringe";
import { type GqlPoeStashTab } from "../../models/basic-models";
import { type PoeApiStashTab } from "../../gql/__generated__/resolvers-types";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "./poe-api";

@singleton()
export class PoeService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService
  ) {}

  public async pullOrUpdateStashTabs(
    userId: string,
    league: string,
    authToken: string,
    forcePull = false
  ): Promise<GqlPoeStashTab[]> {
    if (!forcePull) {
      const tabs = await this.postgresService.prisma.poeStashTab.findMany({
        where: { userId, league },
      });

      if (tabs?.length > 0) {
        tabs.sort((a, b) => a.flatIndex - b.flatIndex);
        return tabs;
      }
    }

    const updatedTabs = await this.updateStashtabs(userId, league, authToken);
    updatedTabs?.sort((a, b) => a.flatIndex - b.flatIndex);
    return updatedTabs;
  }

  public async updateStashtabs(
    userId: string,
    league: string,
    authToken: string
  ): Promise<GqlPoeStashTab[]> {
    const { data: rawStashTabs, rateLimitedForMs } =
      await this.poeApi.fetchStashTabs(authToken, league);

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

      const mappedTabs: GqlPoeStashTab[] = flatStashTabs.map((tab, i) => ({
        id: tab.id,
        userId,
        league,
        parent: tab.parent,
        name: tab.name,
        type: tab.type,
        index: tab.index,
        flatIndex: i,
      }));

      await this.postgresService.prisma.$transaction([
        this.postgresService.prisma.poeStashTab.deleteMany({
          where: { userId, league },
        }),
        this.postgresService.prisma.poeStashTab.createMany({
          data: mappedTabs,
          skipDuplicates: true,
        }),
      ]);
    }

    const resp = await this.postgresService.prisma.poeStashTab.findMany({
      where: { userId, league },
    });
    return resp;
  }
}

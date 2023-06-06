import { singleton } from "tsyringe";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { PassiveTreeService } from "../passive-tree/passive-tree-service";
import { AtlasViewSnapshot } from "@prisma/client";

@singleton()
export class AtlasViewService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly passiveTreeService: PassiveTreeService
  ) {}
  public async snapshot(
    userId: string,
    league: string,
    forceRefresh = false
  ): Promise<AtlasViewSnapshot> {
    const userProfile = await this.postgresService.prisma.userProfile.findFirst(
      { where: { userId: userId } }
    );

    const lastSnapshot =
      await this.postgresService.prisma.atlasViewSnapshot.findFirst({
        where: { userId: userId, league: league },
      });

    if (
      !forceRefresh &&
      lastSnapshot &&
      lastSnapshot.timestamp.getTime() > Date.now() - 1000 * 60 * 30
    ) {
      return lastSnapshot;
    }

    const { data: leagueAccount } = await this.poeApi.fetchLeagueAccount(
      userProfile.oAuthToken,
      league
    );
    const atlasHashes: string[] =
      leagueAccount?.atlas_passives?.hashes?.map((e) => `${e}`) ?? [];

    const nodeTypeCount = {};
    for (const hash of atlasHashes) {
      const node = this.passiveTreeService.atlasTree.getNode(hash);
      if (node) {
        const mastery = this.passiveTreeService.atlasTree.findMasteryByGroup(
          node.group ?? 0
        );
        if (mastery) {
          const key = mastery?.name?.toLocaleLowerCase() ?? "na";
          nodeTypeCount[key] = (nodeTypeCount[key] ?? 0) + 1;
        }
      }
    }

    const res = await this.postgresService.prisma.atlasViewSnapshot.upsert({
      where: { userId_league: { userId: userId, league: league } },
      create: {
        userId: userId,
        league: league,
        hashes: atlasHashes,
        timestamp: new Date(),
        hashTypeCounts: nodeTypeCount,
      },
      update: {
        hashes: atlasHashes,
        hashTypeCounts: nodeTypeCount,
        timestamp: new Date(),
      },
    });
    return res;
  }
}

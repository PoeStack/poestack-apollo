import { singleton } from "tsyringe";
import PostgresService from "../mongo/postgres-service";
import PoeApi from "../poe/poe-api";
import { Prisma, type AtlasPassiveTreeSnapshot } from "@prisma/client";
import { UserService } from "../user-service";
import { PassiveTreeService } from "../passive-tree/passive-tree-service";
import {
  GqlAtlasPassiveSnapshotSearch,
  type GqlGenericAggregation,
} from "../../models/basic-models";
import _ from "lodash";
import { Logger } from "../logger";

@singleton()
export default class AtlasPassiveSnapshotService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly userService: UserService,
    private readonly passiveTreeService: PassiveTreeService
  ) {}

  private async searchToWhere(search: GqlAtlasPassiveSnapshotSearch) {
    const searchConditions: Prisma.Sql[] = [];

    if (search.league) {
      searchConditions.push(Prisma.sql`"league" = ${search.league}`);
    }

    if (search.includedHashes?.length) {
      const jsonB =
        "{" + search.includedHashes.map((e) => `${e}`).join(",") + "}";
      searchConditions.push(Prisma.sql`"hashes" && ${jsonB}::int[]`);
    }

    if (search.excludedHashes?.length) {
      const jsonB =
        "{" + search.excludedHashes.map((e) => `${e}`).join(",") + "}";
      searchConditions.push(Prisma.sql`not "hashes" && ${jsonB}::int[]`);
    }

    const where =
      searchConditions.length > 0
        ? Prisma.sql`where ${Prisma.join(searchConditions, " and ")}`
        : Prisma.empty;
    return where;
  }

  public async aggregateHashes(
    search: GqlAtlasPassiveSnapshotSearch
  ): Promise<GqlGenericAggregation> {
    const where = await this.searchToWhere(search);

    const results: any[] = await this.postgresService.prisma.$queryRaw`
    select "hash" as key, count(*) as value from "AtlasPassiveTreeSnapshot", unnest("hashes") as "hash"
    ${where}
    group by "hash"
    order by "value" desc`;

    const resp: GqlGenericAggregation = {
      values: results.map((e) => ({
        key: e.key.toString(),
        value: Number(e.value),
      })),
    };
    return resp;
  }

  public async takeAtlasSnapshot(
    userId: string,

    source: string
  ) {
    const characters = await this.postgresService.prisma.poeCharacter.findMany({
      where: { userId: userId },
      select: { lastLeague: true },
    });
    const leagues = _.uniq(characters.map((e) => e.lastLeague));

    const oAuthToken = await this.userService.fetchUserOAuthTokenSafe(userId);
    for (const league of leagues) {
      const { data: leagueAccount } = await this.poeApi.fetchLeagueAccount(
        oAuthToken,
        league
      );

      const atlasHashes = leagueAccount?.atlas_passives?.hashes;
      if (atlasHashes?.length > 0) {
        const snap: AtlasPassiveTreeSnapshot = {
          userId,
          league,
          systemSnapshotTimestamp: new Date(),
          createdAtTimestamp: new Date(),

          hashes: atlasHashes,
          source,
        };
        snap.systemSnapshotTimestamp.setUTCHours(0, 0, 0, 0);

        await this.postgresService.prisma.atlasPassiveTreeSnapshot.upsert({
          where: {
            userId_league_systemSnapshotTimestamp: {
              league,
              userId,
              systemSnapshotTimestamp: snap.systemSnapshotTimestamp,
            },
          },
          create: snap,
          update: snap,
        });
      }
    }
  }
}

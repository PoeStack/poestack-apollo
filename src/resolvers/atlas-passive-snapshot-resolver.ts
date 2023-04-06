import { Arg, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import AtlasPassiveSnapshotService from "../services/snapshot/atlas-passive-snapshot-service";
import PostgresService from "../services/mongo/postgres-service";
import { Prisma } from "@prisma/client";
import {
  GqlAtlasPassiveSnapshot,
  GqlAtlasPassiveSnapshotResponse,
  GqlAtlasPassiveSnapshotSearch,
  GqlGenericAggregation,
} from "../models/basic-models";

@Resolver()
@singleton()
export class AtlasPassiveSnapshotResolve {
  constructor(
    private readonly atlasPassiveSnapshotService: AtlasPassiveSnapshotService,
    private readonly postgresService: PostgresService
  ) {}
  @Query(() => GqlAtlasPassiveSnapshotResponse)
  async atlasPassiveSnapshotsByUser(
    @Arg("userId") userId: string,
    @Arg("timestampEndInclusive", { nullable: true })
    timestampEndInclusive?: Date
  ) {
    const timestampFilter = timestampEndInclusive
      ? Prisma.sql` and ia."systemSnapshotTimestamp" <= ${timestampEndInclusive}`
      : Prisma.empty;
    const results: GqlAtlasPassiveSnapshot[] = await this.postgresService.prisma
      .$queryRaw`
    select
      *
    from
      (
      select
        league,
        max("systemSnapshotTimestamp")
      from
        "AtlasPassiveTreeSnapshot" ia
      where
        ia."userId" = ${userId}${timestampFilter}
      group by
        league) ia
    join "AtlasPassiveTreeSnapshot" oa on
      oa."userId" = ${userId}
      and oa.league = ia.league
      and oa."systemSnapshotTimestamp" = ia."max"`;

    const resp: GqlAtlasPassiveSnapshotResponse = {
      results: results,
    };

    return resp;
  }

  @Query(() => GqlGenericAggregation)
  async atlasPassiveTreeSnapshotPopularityAggregation(
    @Arg("search") search: GqlAtlasPassiveSnapshotSearch
  ) {
    const resp = await this.atlasPassiveSnapshotService.aggregateHashes(search);
    return resp;
  }
}

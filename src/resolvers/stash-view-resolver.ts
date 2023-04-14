import {
  GqlStashViewItemSummary,
  GqlStashViewJob,
  GqlStashViewSnapshotInput,
  GqlStashViewValueSnapshotSeries,
} from "./../models/basic-models";
import { PoeStackContext } from "./../index";

import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";
import StashViewService from "../services/stash-view/stash-view-service";
import _ from "lodash";

@Resolver()
@singleton()
export class StashViewResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly stashViewService: StashViewService
  ) {}

  @Mutation(() => String)
  async stashViewSnapshot(
    @Arg("input") input: GqlStashViewSnapshotInput,
    @Ctx() ctx: PoeStackContext
  ) {
    const jobId = await this.stashViewService.takeSnapshot(
      ctx.userId,
      input.league,
      input.stashIds
    );
    return jobId;
  }

  @Query(() => [GqlStashViewValueSnapshotSeries])
  async stashViewValueSnapshotSeries(
    @Ctx() ctx: PoeStackContext,
    @Arg("league") league: string
  ) {
    const snapshots =
      await this.postgresService.prisma.stashViewValueSnapshot.findMany({
        where: { userId: ctx.userId, league: league },
        select: { timestamp: true, stashId: true, value: true },
      });

    const mappedSeries: GqlStashViewValueSnapshotSeries[] = [];

    Object.entries(_.groupBy(snapshots, (e) => e.stashId)).forEach(
      ([stashId, series]) => {
        mappedSeries.push({
          stashId: stashId,
          values: series.map((e) => e.value),
          timestamps: series.map((e) => e.timestamp),
        });
      }
    );

    return mappedSeries;
  }

  @Query(() => GqlStashViewJob)
  async stashViewJobStat(
    @Ctx() ctx: PoeStackContext,
    @Arg("jobId") jobId: string
  ) {
    const job =
      await this.postgresService.prisma.stashViewSnapshotJob.findFirst({
        where: { id: jobId },
      });
    return job;
  }

  @Query(() => [GqlStashViewItemSummary])
  async stashViewSummary(
    @Ctx() ctx: PoeStackContext,
    @Arg("league") league: string
  ) {
    const items = await this.stashViewService.fetchItemSummaries(
      ctx.userId,
      league
    );
    return items;
  }
}

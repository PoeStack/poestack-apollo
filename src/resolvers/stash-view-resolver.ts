import {
  GqlStashViewAutomaticSnapshotSettings,
  GqlStashViewAutomaticSnapshotSettingsInput,
  GqlStashViewItemSummary,
  GqlStashViewJob,
  GqlStashViewSettings,
  GqlStashViewSnapshotInput,
  GqlStashViewStashSummary,
  GqlStashViewStashSummarySearch,
  GqlStashViewValueSnapshotSeries,
} from "./../models/basic-models";
import { PoeStackContext } from "./../index";

import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";
import StashViewService from "../services/stash-view/stash-view-service";
import _ from "lodash";
import { GraphQLBoolean } from "graphql";
import { GraphQLJSON } from "graphql-scalars";

@Resolver()
@singleton()
export class StashViewResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly stashViewService: StashViewService
  ) {}

  @Mutation(() => Boolean)
  async deleteStashViewValueSnapshotSeries(@Ctx() ctx: PoeStackContext) {
    await this.postgresService.prisma.stashViewValueSnapshot.deleteMany({
      where: { userId: ctx.userId },
    });
    return true;
  }

  @Mutation(() => String)
  async stashViewSnapshot(
    @Arg("input") input: GqlStashViewSnapshotInput,
    @Ctx() ctx: PoeStackContext
  ) {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      {
        where: { userId: ctx.userId },
      }
    );
    const jobId = await this.stashViewService.takeSnapshot(
      user.userId,
      user.opaqueKey,
      input.league,
      input.stashIds
    );
    return jobId;
  }

  @Mutation(() => String)
  async stashViewOneClickMessage(
    @Arg("input") input: GqlStashViewSettings,
    @Ctx() ctx: PoeStackContext
  ) {
    const messageBody = await this.stashViewService.oneClickPostMessage(
      ctx.userId,
      input
    );
    return messageBody + "\nusing https://poestack.com/tft/bulk-tool";
  }

  @Mutation(() => Boolean)
  async stashViewOneClickPost(
    @Arg("input") input: GqlStashViewSettings,
    @Ctx() ctx: PoeStackContext
  ) {
    await this.stashViewService.oneClickPost(ctx.userId, input);
    return true;
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

  @Query(() => GqlStashViewAutomaticSnapshotSettings)
  async stashViewAutomaticSnapshotSettings(
    @Ctx() ctx: PoeStackContext,
    @Arg("league") league: string
  ) {
    const settings =
      await this.postgresService.prisma.stashViewAutomaticSnapshotSettings.findUnique(
        { where: { userId_league: { userId: ctx.userId, league: league } } }
      );
    return settings;
  }

  @Mutation(() => GraphQLBoolean)
  async updateStashViewAutomaticSnapshotSettings(
    @Ctx() ctx: PoeStackContext,
    @Arg("input") input: GqlStashViewAutomaticSnapshotSettingsInput
  ) {
    const durationBetweenSnapshotsSeconds = Math.max(
      input.durationBetweenSnapshotsSeconds,
      60 * 5
    );
    const nextSnapshotTimestamp = new Date(
      Date.now() + durationBetweenSnapshotsSeconds * 1000
    );
    await this.postgresService.prisma.stashViewAutomaticSnapshotSettings.upsert(
      {
        where: { userId_league: { userId: ctx.userId, league: input.league } },
        create: {
          league: input.league,
          userId: ctx.userId,
          durationBetweenSnapshotsSeconds: durationBetweenSnapshotsSeconds,
          stashIds: input.stashIds,
          nextSnapshotTimestamp: nextSnapshotTimestamp,
        },
        update: {
          stashIds: input.stashIds,
          nextSnapshotTimestamp: nextSnapshotTimestamp,
          durationBetweenSnapshotsSeconds: durationBetweenSnapshotsSeconds,
        },
      }
    );
    return true;
  }

  @Query(() => GraphQLJSON)
  async stashViewStashSummary(
    @Ctx() ctx: PoeStackContext,
    @Arg("search") search: GqlStashViewStashSummarySearch
  ) {
    let userId = ctx.userId;

    if (!search.opaqueKey) {
      throw new Error("removed.");
    }

    if (search.opaqueKey) {
      const user =
        await this.postgresService.prisma.userProfile.findFirstOrThrow({
          where: { opaqueKey: search.opaqueKey },
        });
      userId = user.userId;
    }

    const summary = await this.stashViewService.fetchStashViewTabSummary(
      userId,
      search
    );
    return summary;
  }
}

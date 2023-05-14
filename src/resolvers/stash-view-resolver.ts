import {
  GqlStashViewAutomaticSnapshotSettings,
  GqlStashViewAutomaticSnapshotSettingsInput,
  GqlStashViewJob,
  GqlStashViewSettings,
  GqlStashViewSnapshotInput,
  GqlStashViewSnapshotRecord,
  GqlStashViewSnapshotRecordUpdateInput,
  GqlStashViewStashSummary,
  GqlStashViewValueSnapshotSeries,
} from "./../models/basic-models";
import { PoeStackContext } from "./../index";

import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";
import StashViewService from "../services/stash-view/stash-view-service";
import _ from "lodash";
import { GraphQLBoolean } from "graphql";
import StashViewSnapshotService from "../services/stash-view/stash-view-snapshot-service";
import { SNAPSHOT_FAVORITE_LIMITS_BY_PATREON_TIER } from "../services/stash-view/stash-view-snapshot-service";

@Resolver()
@singleton()
export class StashViewResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly stashViewService: StashViewService,
    private readonly stashViewSnapshotService: StashViewSnapshotService
  ) {}

  @Mutation(() => Boolean)
  async deleteStashViewValueSnapshotSeries(@Ctx() ctx: PoeStackContext) {
    await this.postgresService.prisma.stashViewValueSnapshot.deleteMany({
      where: { userId: ctx.userId },
    });
    return true;
  }

  @Mutation(() => Boolean)
  async stashViewUpdateSnapshotRecord(
    @Ctx() ctx: PoeStackContext,
    @Arg("input") input: GqlStashViewSnapshotRecordUpdateInput
  ) {
    if (input.favorited) {
      const currentSnapshot =
        await this.postgresService.prisma.stashViewSnapshotRecord.findFirstOrThrow(
          {
            where: {
              userId: ctx.userId,
              league: input.league,
              timestamp: input.timestamp,
            },
          }
        );

      if (!currentSnapshot.favorited) {
        const user =
          await this.postgresService.prisma.userProfile.findFirstOrThrow({
            where: { userId: ctx.userId },
          });
        const favoriteLimit =
          SNAPSHOT_FAVORITE_LIMITS_BY_PATREON_TIER[user.patreonTier] ?? 1;
        const favoritedSnapshotCount =
          await this.postgresService.prisma.stashViewSnapshotRecord.count({
            where: { userId: ctx.userId, league: input.league },
          });

        if (favoritedSnapshotCount + 1 > favoriteLimit) {
          throw new Error(
            `Your current Patreon tier is limited to ${favoriteLimit} favorite(s).`
          );
        }
      }
    }

    await this.postgresService.prisma.stashViewSnapshotRecord.update({
      where: {
        userId_league_timestamp: {
          league: input.league,
          userId: ctx.userId,
          timestamp: input.timestamp,
        },
      },
      data: { name: input.name, favorited: input.favorited },
    });
    return true;
  }

  @Query(() => [GqlStashViewSnapshotRecord])
  async stashViewSnapshotRecords(
    @Ctx() ctx: PoeStackContext,
    @Arg("league") league: string
  ) {
    const res =
      await this.postgresService.prisma.stashViewSnapshotRecord.findMany({
        where: { userId: ctx.userId, league: league },
        orderBy: { timestamp: "desc" },
      });
    return res;
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
    const jobId = await this.stashViewSnapshotService.takeSnapshot({
      userId: user.userId,
      userOpaqueKey: user.opaqueKey,
      league: input.league,
      selectedTabIds: input.stashIds,
    });
    return jobId;
  }

  @Mutation(() => String)
  async stashViewOneClickMessage(
    @Arg("input") input: GqlStashViewSettings,
    @Ctx() ctx: PoeStackContext
  ) {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { userId: ctx.userId } }
    );
    const messageBody = await this.stashViewService.oneClickPostMessage(
      user.opaqueKey,
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

  @Query(() => GqlStashViewStashSummary)
  async stashViewItemSummary(@Ctx() ctx: PoeStackContext) {
    return {};
  }
}

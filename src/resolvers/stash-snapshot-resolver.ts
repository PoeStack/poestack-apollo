import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import StashSnapshotService from "../services/snapshot/snapshot-service";
import { PoeStackContext } from "..";
import {
  GqlStashSnapshotItemGroupSummarySearchAggregationResponse,
  GqlStashSnapshotProfileInput,
  GqlStashSnapshot,
  GqlStashSnapshotItemGroupSummarySearch,
  GqlStashSnapshotItemGroupSummarySearchResponse,
  GqlStashSnapshotProfile,
  GqlDetachedStashSnapshotInput,
} from "../models/basic-models";

@Resolver()
@singleton()
export class StashSnapshotResolver {
  constructor(
    private readonly stashSnapshotService: StashSnapshotService,
    private readonly postgresService: PostgresService
  ) {}

  @Mutation(() => Boolean)
  async deleteSnapshots(
    @Ctx() ctx: PoeStackContext,
    @Arg("stashSnapshotIds", (type) => [String]) snapshotIds: string[]
  ) {
    await this.postgresService.prisma.stashSnapshot.deleteMany({
      where: { userId: ctx.userId, id: { in: snapshotIds } },
    });
    return true;
  }

  @Query(() => [GqlStashSnapshot])
  async stashSnapshots(
    @Ctx() ctx: PoeStackContext,
    @Arg("stashSnapshotProfileId") profileId: string
  ) {
    await this.stashSnapshotService.fetchProfileSafe(ctx.userId, profileId);
    const snpshots = await this.postgresService.prisma.stashSnapshot.findMany({
      where: { snapshotProfileId: profileId },
      orderBy: { createdAtTimestamp: "asc" },
    });
    return snpshots;
  }

  @Query(() => GqlStashSnapshot)
  async stashSnapshot(
    @Ctx() ctx: PoeStackContext,
    @Arg("stashSnapshotProfileId") profileId: string,
    @Arg("stashSnapshotId") snapshotId: string
  ) {
    await this.stashSnapshotService.fetchProfileSafe(ctx.userId, profileId);
    const snpshots = await this.postgresService.prisma.stashSnapshot.findFirst({
      where: { snapshotProfileId: profileId, id: snapshotId },
    });
    return snpshots;
  }

  @Query(() => GqlStashSnapshotItemGroupSummarySearchAggregationResponse)
  async stashSnapshotItemGroupSummariesAggregation(
    @Ctx() ctx: PoeStackContext,
    @Arg("aggregation") aggregation: string,
    @Arg("search") search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    const resp =
      await this.stashSnapshotService.fetchStashSnapshotItemSummariesAggregation(
        aggregation,
        search
      );
    return resp;
  }

  @Query(() => GqlStashSnapshotItemGroupSummarySearchResponse)
  async stashSnapshotItemGroupSummaries(
    @Ctx() ctx: PoeStackContext,
    @Arg("search") search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    const resp =
      await this.stashSnapshotService.fetchStashSnapshotItemSummaries(search);
    return resp;
  }

  @Query(() => [GqlStashSnapshotProfile])
  async stashSnapshotProfiles(@Ctx() ctx: PoeStackContext) {
    const resp =
      await this.postgresService.prisma.stashSnapshotProfile.findMany({
        where: { userId: ctx.userId },
      });
    return resp;
  }

  @Query(() => GqlStashSnapshotProfile)
  async stashSnapshotProfile(
    @Ctx() ctx: PoeStackContext,
    @Arg("snapshotProfileId") snapshotProfileId: string
  ) {
    const profile = await this.stashSnapshotService.fetchProfileSafe(
      ctx?.userId,
      snapshotProfileId
    );
    return profile;
  }

  @Mutation(() => Boolean)
  async updateStashsnapshotProfile(
    @Arg("update") update: GqlStashSnapshotProfileInput,
    @Ctx() ctx: PoeStackContext
  ) {
    const profile: GqlStashSnapshotProfile = {
      ...update,
      ...{ userId: ctx.userId, createdAtTimestamp: undefined },
    };
    await this.postgresService.prisma.stashSnapshotProfile.upsert({
      where: { id_userId: { userId: ctx.userId, id: profile.id } },
      create: { ...profile, ...{ createdAtTimestamp: new Date() } },
      update: profile,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async deleteStashSnapshotProfile(
    @Arg("stashSnapshotProfileId") profileId: string,
    @Ctx() ctx: PoeStackContext
  ) {
    await this.postgresService.prisma.stashSnapshotProfile.deleteMany({
      where: { userId: ctx.userId, id: profileId },
    });
    return true;
  }

  @Mutation(() => GqlStashSnapshot)
  async takeSnapshot(
    @Arg("stashSnapshotProfileId") profileId: string,
    @Ctx() ctx: PoeStackContext
  ) {
    const resp = await this.stashSnapshotService.takeProfileSnapshot(
      ctx.userId,
      profileId
    );
    return resp;
  }

  @Mutation(() => GqlStashSnapshot)
  async takeDeatachedSnapshot(
    @Arg("input") input: GqlDetachedStashSnapshotInput,
    @Ctx() ctx: PoeStackContext
  ) {
    input.userId = ctx.userId;
    const resp = await this.stashSnapshotService.takeSnapshot(input);
    return resp;
  }
}

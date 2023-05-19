import { Query, Resolver, Ctx, Mutation, Arg } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { PoeStackContext } from "..";
import {
  GqlCharacterSnapshot,
  GqlCharacterSnapshotRecord,
  GqlCharacterSnapshotSearch,
  GqlCharacterSnapshotSearchResponse,
  GqlPoeCharacter,
} from "../models/basic-models";
import { GraphQLBoolean } from "graphql";
import CharacterSnapshotService from "../services/snapshot/character-snapshot-service";
import { S3Service } from "../services/s3-service";

@Resolver()
@singleton()
export class CharacterSnapshotResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly characterSnapshotService: CharacterSnapshotService,
    private readonly s3Service: S3Service
  ) { }

  @Query(() => [GqlPoeCharacter])
  async poeCharacters(
    @Ctx() ctx: PoeStackContext,
    @Arg("userId") userId: string
  ) {
    const resp = await this.postgresService.prisma.poeCharacter.findMany({
      where: {
        userId,
      },
      orderBy: { name: "desc" },
    });
    return resp;
  }

  @Query(() => [GqlCharacterSnapshotRecord])
  async characterSnapshotRecords(
    @Ctx() ctx: PoeStackContext,
    @Arg("characterId") characterId: string
  ) {
    const resp =
      await this.postgresService.prisma.characterSnapshotRecord.findMany({
        where: { characterId },
        orderBy: { timestamp: "asc" },
      });
    return resp;
  }

  @Query(() => GqlCharacterSnapshot)
  async characterSnapshot(
    @Ctx() ctx: PoeStackContext,
    @Arg("snapshotId") snapshotId: string
  ) {
    const resp = await this.s3Service.getJson(
      "poe-stack",
      `character-snapshots/${snapshotId}.json`
    );
    return resp;
  }

  @Query(() => GqlCharacterSnapshotSearchResponse)
  async characterSnapshotsSearch(
    @Ctx() ctx: PoeStackContext,
    @Arg("search") search: GqlCharacterSnapshotSearch
  ) {
    const resp = await this.characterSnapshotService.searchSnapshots(search);
    return resp;
  }

  @Mutation(() => GraphQLBoolean)
  async refreshPoeCharacters(@Ctx() ctx: PoeStackContext) {
    await this.characterSnapshotService.updatePoeCharacters(ctx.userId);
    return true;
  }

  @Mutation(() => GraphQLBoolean)
  async takeCharacterSnapshot(
    @Ctx() ctx: PoeStackContext,
    @Arg("characterId") characterId: string
  ) {
    await this.characterSnapshotService.takeSnapshot(
      ctx.userId,
      characterId,
      "user"
    );
    return true;
  }
}

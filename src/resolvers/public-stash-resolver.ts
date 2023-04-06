import { Arg, Ctx, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { PoeStackContext } from "..";
import { GraphQLJSON } from "graphql-scalars";
import { S3Service } from "../services/s3-service";
import {
  GqlPublicStashUpdateRecordResponse,
  GqlPublicStashUpdateRecordSearch,
} from "../models/basic-models";

@Resolver()
@singleton()
export class PublicStashResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly s3Service: S3Service
  ) {}

  @Query(() => GraphQLJSON, { nullable: true })
  async publicStash(@Ctx() ctx: PoeStackContext, @Arg("id") id: string) {
    const resp = await this.s3Service.getJson(
      "poe-stack-poe-public-stashes",
      `${id}.json`
    );
    return resp;
  }

  @Query(() => GqlPublicStashUpdateRecordResponse)
  async publicStashUpdateRecords(
    @Ctx() ctx: PoeStackContext,
    @Arg("search") search: GqlPublicStashUpdateRecordSearch
  ) {
    const resp =
      await this.postgresService.prisma.poePublicStashUpdateRecord.findMany({
        where: { poeProfileName: { in: search.poeProfileNames } },
      });
    return { results: resp };
  }
}

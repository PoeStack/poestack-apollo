import { PoeStackContext } from "index";
import {
  GqlStashViewAutomaticSnapshotSettings,
  GqlTftLiveListing,
} from "../models/basic-models";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver } from "type-graphql";

@Resolver()
@singleton()
export class TftLiveListingsResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => [GqlTftLiveListing])
  async tftLiveListings(@Ctx() ctx: PoeStackContext) {
    const tftLiveListings =
      await this.postgresService.prisma.tftLiveListing.findMany({
        where: { delistedAtTimestamp: null },
        orderBy: { updatedAtTimestamp: "desc" },
      });
    return tftLiveListings;
  }
}

import { GqlStashViewItemSummary } from "./../models/basic-models";
import { PoeStackContext } from "./../index";

import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";

@Resolver()
@singleton()
export class StashViewResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => [GqlStashViewItemSummary])
  async stashViewSummary(
    @Arg("league") league: string,
    @Ctx() ctx: PoeStackContext
  ) {
    const items =
      await this.postgresService.prisma.stashViewItemSummary.findMany({
        where: { userId: ctx.userId, league: league },
      });
    return items;
  }
}

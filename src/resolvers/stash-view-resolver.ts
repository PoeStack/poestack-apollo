import { PoeStackContext } from "./../index";
import { GqlStashViewTabSummary } from "./../models/basic-models";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";

@Resolver()
@singleton()
export class StashViewResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => [GqlStashViewTabSummary])
  async stashViewTabs(
    @Arg("league") league: string,
    @Ctx() ctx: PoeStackContext
  ) {
    const tabs = await this.postgresService.prisma.stashViewTabSummary.findMany(
      { where: { userId: ctx.userId, league: league } }
    );
    return tabs;
  }
}

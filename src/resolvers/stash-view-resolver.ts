import { GqlStashViewItemSummary } from "./../models/basic-models";
import { PoeStackContext } from "./../index";

import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";
import StashViewService from "../services/stash-view/stash-view-service";

@Resolver()
@singleton()
export class StashViewResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly stashViewService: StashViewService
  ) {}

  @Query(() => [GqlStashViewItemSummary])
  async stashViewSummary(
    @Arg("league") league: string,
    @Ctx() ctx: PoeStackContext
  ) {
    const items = await this.stashViewService.fetchItemSummaries(
      ctx.userId,
      league
    );
    return items;
  }
}

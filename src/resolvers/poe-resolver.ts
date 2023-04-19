import { Arg, Ctx, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { PoeStackContext } from "..";
import { GqlGenericAggregation, GqlPoeStashTab } from "../models/basic-models";
import { PoeService } from "../services/poe/poe-service";
import { UserService } from "../services/user-service";
import PoeApi from "../services/poe/poe-api";
import { GqlPoeLeague } from "../models/poe-models";

@Resolver()
@singleton()
export class PoeResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly poeService: PoeService,
    private readonly poeApi: PoeApi,
    private readonly userService: UserService
  ) {}

  @Query(() => GqlGenericAggregation)
  async leagueActvityTimeseries(@Ctx() ctx: PoeStackContext) {
    const rows = await this.postgresService.prisma.$queryRaw`
      select "league" as "key", "timestamp" as "timestamp", "players" as "value" from "PoeLeagueActivitySnapshot"
      where "lookbackWindowHours" = 1
      order by "timestamp" asc`;
    return { values: rows };
  }

  @Query(() => [GqlPoeLeague])
  async leagues(@Ctx() ctx: PoeStackContext) {
    const token = await this.userService.fetchUserOAuthTokenSafe(ctx.userId);
    const { data } = await this.poeApi.fetchLeagues(token);
    return data;
  }

  @Query(() => [GqlPoeStashTab])
  async stashTabs(
    @Ctx() ctx: PoeStackContext,
    @Arg("league") league: string,
    @Arg("forcePull", { nullable: true }) forcePull?: boolean
  ) {
    const token = await this.userService.fetchUserOAuthTokenSafe(ctx.userId);
    const resp = await this.poeService.pullOrUpdateStashTabs(
      ctx.userId,
      league,
      token,
      forcePull
    );
    return resp;
  }
}

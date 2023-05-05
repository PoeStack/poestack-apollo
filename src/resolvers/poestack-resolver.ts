import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver, Mutation } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { PoeStackContext } from "..";
import { Logger } from "../services/logger";
import { GraphQLJSON } from "graphql-scalars";

@Resolver()
@singleton()
export class PoeStackResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => GraphQLJSON)
  public async poestackStats(@Ctx() ctx: PoeStackContext) {
    const stats: any = {};

    stats.users = await this.postgresService.prisma.userProfile.count();
    stats.poeCharacters =
      await this.postgresService.prisma.poeCharacter.count();
    stats.items = await this.postgresService.prisma.itemGroupInfo.count();
    stats.oneClickMessages =
      await this.postgresService.prisma.oneClickMessageHistory.count();

    return stats;
  }

  @Mutation(() => Boolean)
  public async routeChange(
    @Ctx() ctx: PoeStackContext,
    @Arg("pathname") pathname: string,
    @Arg("path") path: string
  ) {
    Logger.info("page view", {
      userId: ctx.userId,
      path: path,
      pathname: pathname,
    });
    return true;
  }
}

import { PoeStackContext } from "../index";
import { GqlLadderViewVectorRecord } from "../models/basic-models";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver } from "type-graphql";

@Resolver()
@singleton()
export class LadderViewResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => [GqlLadderViewVectorRecord])
  async ladderViewVectorRecords(
    @Ctx() ctx: PoeStackContext,
    @Arg("league") league: string
  ) {
    const res =
      await this.postgresService.prisma.ladderViewVectorRecord.findMany({
        where: { league: league },
        orderBy: { timestamp: "desc" },
      });
    return res;
  }
}

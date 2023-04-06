import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";

@Resolver()
@singleton()
export class ItemGroupResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemValueHistoryService: ItemValueHistoryService
  ) {}

  @Query(() => [String])
  async itemGroupTags(@Arg("league") league: string) {
    const tags = await this.postgresService.prisma.itemGroupInfo.findMany({
      distinct: ["tag"],
      select: { tag: true },
    });
    return tags.map((e) => e.tag).sort();
  }

  @Query(() => Float)
  async itemGroupValueChaos(
    @Arg("league") league: string,
    @Arg("key") key: string
  ) {
    const value =
      await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
        league,
        key
      );
    return value;
  }
}

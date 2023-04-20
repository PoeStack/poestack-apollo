import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";
import { GqlItemGroupListing } from "../models/basic-models";

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

  @Query(() => [GqlItemGroupListing])
  async itemGroupListings(
    @Arg("league") league: string,
    @Arg("hashString") hashString: string
  ) {
    const listings =
      await this.postgresService.prisma.publicStashListing.findMany({
        where: { league: league, itemGroupHashString: hashString },
        orderBy: { listedValueChaos: "asc" },
        take: 300,
      });
    return listings;
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

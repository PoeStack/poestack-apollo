import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";
import { GqlItemGroupListing } from "../models/basic-models";
import MathUtils from "../services/utils/math-utils";

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
    @Arg("hashString") hashString: string,
    @Arg("minStock", { nullable: true, defaultValue: 0 }) minStock: number = 0
  ) {
    const listings: any[] = await this.postgresService.prisma
      .$queryRaw`select * from (select max("listedAtTimestamp") as "listedAtTimestamp", "accountName", avg("listedValueChaos") as "listedValueChaos", sum("stackSize") as "stackSize" from "PublicStashListing" psl 
      where "itemGroupHashString" = ${hashString} and "league" = ${league} and "listedAtTimestamp" > now() at time zone 'utc' - INTERVAL '3 hour'
      group by "accountName") x
      where x."stackSize" >= ${minStock}
      order by x."listedValueChaos" asc`;

    const filteredListings = MathUtils.filterOutliersBy(listings, (e) =>
      Number(e.listedValueChaos)
    );

    const start = Math.floor(filteredListings.length * 0.02);
    return filteredListings.slice(start, start + 20).map((e) => ({
      accountName: e.accountName,
      listedAtTimestamp: e.listedAtTimestamp,
      stackSize: Number(e.stackSize),
      listedValueChaos: Number(e.listedValueChaos),
    }));
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

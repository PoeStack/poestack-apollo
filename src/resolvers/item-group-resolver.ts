import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";
import { GqlItemGroupListing } from "../models/basic-models";
import LiveListingService from "../services/live-pricing/live-listing-service";

@Resolver()
@singleton()
export class ItemGroupResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly livePricingService: LiveListingService
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
    const listings = await this.livePricingService.fetchListings({
      itemGroupHashString: hashString,
      league: league,
    });

    const filteredListings = listings.filter((e) => e.quantity >= minStock);

    const start = Math.floor(filteredListings.length * 0.02);
    return filteredListings.slice(start, start + 20);
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

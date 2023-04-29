import { singleton } from "tsyringe";
import NodeCache from "node-cache";
import PostgresService from "../../services/mongo/postgres-service";
import MathUtils from "../../services/utils/math-utils";
import { GqlItemGroupListing } from "../../models/basic-models";
import { LRUCache } from "lru-cache";

@singleton()
export default class ItemGroupLivePricingService {
  private readonly listingsCache = new LRUCache<string, GqlItemGroupListing[]>({
    maxSize: 100_000 * 7,
    sizeCalculation: (value, key) => {
      return (value?.length ?? 0) + 1;
    },

    ttl: 1000 * 60 * 15,
    allowStale: false,

    updateAgeOnGet: false,
    updateAgeOnHas: false,
  });

  constructor(private readonly postgresService: PostgresService) {}

  public async fetchListings(search: {
    itemGroupHashString: string;
    league: string;
  }): Promise<GqlItemGroupListing[]> {
    const cacheKey = `${search.itemGroupHashString}__${search.league}`;

    const cachedListings: GqlItemGroupListing[] =
      this.listingsCache.get(cacheKey);
    if (cachedListings) {
      console.log("cache hit: " + cacheKey);
      return cachedListings;
    }
    console.log("cache miss: " + cacheKey);

    const listings: {
      listedAtTimestamp: Date;
      poeProfileName: string;
      listedValue: number;
      quantity: number;
    }[] = await this.postgresService.prisma
      .$queryRaw`select * from (select max("listedAtTimestamp") as "listedAtTimestamp", "poeProfileName", avg("listedValue") as "listedValue", sum("quantity") as "quantity" from "PoeLiveListing" psl 
      where "itemGroupHashString" = ${search.itemGroupHashString} and "league" = ${search.league} and "listedAtTimestamp" > now() at time zone 'utc' - INTERVAL '3 hour'
      group by "poeProfileName") x
      order by x."listedValue" asc`;

    const filteredListings: GqlItemGroupListing[] = MathUtils.filterOutliersBy(
      listings,
      (e) => Number(e.listedValue)
    ).map((e) => ({
      poeProfileName: e.poeProfileName,
      listedAtTimestamp: e.listedAtTimestamp,
      quantity: Number(e.quantity),
      listedValue: Number(e.listedValue),
    }));

    this.listingsCache.set(cacheKey, filteredListings);
    return filteredListings;
  }
}

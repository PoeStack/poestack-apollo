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
      return value?.length;
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

    const listings: any[] = await this.postgresService.prisma
      .$queryRaw`select * from (select max("listedAtTimestamp") as "listedAtTimestamp", "accountName", avg("listedValueChaos") as "listedValueChaos", sum("stackSize") as "stackSize" from "PublicStashListing" psl 
    where "itemGroupHashString" = ${search.itemGroupHashString} and "league" = ${search.league} and "listedAtTimestamp" > now() at time zone 'utc' - INTERVAL '3 hour'
    group by "accountName") x
    order by x."listedValueChaos" asc`;

    const filteredListings: GqlItemGroupListing[] = MathUtils.filterOutliersBy(
      listings,
      (e) => Number(e.listedValueChaos)
    ).map((e) => ({
      accountName: e.accountName,
      listedAtTimestamp: e.listedAtTimestamp,
      stackSize: Number(e.stackSize),
      listedValueChaos: Number(e.listedValueChaos),
    }));

    this.listingsCache.set(cacheKey, filteredListings);
    return filteredListings;
  }
}

import { singleton } from "tsyringe";
import PostgresService from "../mongo/postgres-service";
import { GqlItemGroupListing } from "../../models/basic-models";
import { LRUCache } from "lru-cache";
import { Logger } from "../logger";
import StopWatch from "../utils/stop-watch";
import { GeneralUtils } from "../../utils/general-util";

export interface LiveListingSearch {
  itemGroupHashString: string;
  league: string;
}

@singleton()
export default class LiveListingService {
  private cacheStats = { hits: 0, misses: 0 };

  private readonly listingsCache = new LRUCache<string, GqlItemGroupListing[]>({
    ttl: 1000 * 60 * 15,

    maxSize: 100_000 * 14,
    sizeCalculation: (value, key) => {
      return (value?.length ?? 0) + 1;
    },

    updateAgeOnGet: false,
    updateAgeOnHas: false,
  });

  constructor(private readonly postgresService: PostgresService) {}

  public async fetchListings(
    search: LiveListingSearch
  ): Promise<GqlItemGroupListing[]> {
    if (this.cacheStats.misses + this.cacheStats.hits >= 10000) {
      Logger.info("live pricing cache", this.cacheStats);
      this.cacheStats = { hits: 0, misses: 0 };
    }

    const cacheKey = `${search.league}__${search.itemGroupHashString}`;
    const cachedListings = this.listingsCache.get(cacheKey);
    if (cachedListings) {
      Logger.debug("live pricing cache hit", cacheKey);
      this.cacheStats.hits++;
      return cachedListings;
    }

    this.cacheStats.misses++;
    const liveListings = await this.fetchListingsInternal(search);
    this.listingsCache.set(cacheKey, liveListings, {
      ttl: GeneralUtils.random(1000 * 60 * 30, 1000 * 60 * 60),
    });

    return liveListings;
  }

  private async fetchListingsInternal(
    search: LiveListingSearch
  ): Promise<GqlItemGroupListing[]> {
    const sw = new StopWatch(true);
    const listings: {
      listedAtTimestamp: Date;
      poeProfileName: string;
      listedValue: number;
      quantity: number;
    }[] = await this.postgresService.prisma
      .$queryRaw`select * from (select max("listedAtTimestamp") as "listedAtTimestamp", avg("listedValue") as "listedValue", sum("quantity") as "quantity" from "PoeLiveListing" psl 
      where "itemGroupHashString" = ${search.itemGroupHashString} and "league" = ${search.league} and "listedAtTimestamp" > now() at time zone 'utc' - INTERVAL '8 hour'
      group by "poeProfileName") x
      order by x."listedAtTimestamp" desc`;

    const mappedListings: GqlItemGroupListing[] = listings.map((e) => ({
      listedAtTimestamp: e.listedAtTimestamp,
      quantity: Number(e.quantity),
      listedValue: Number(e.listedValue),
    }));

    Logger.debug("live pricing cache updated", {
      league: search.league,
      itemGroupHashString: search.itemGroupHashString,
      listings: listings.length,
      mappedListings: mappedListings.length,
      ms: sw.elapsedMS(),
    });

    return mappedListings;
  }

  public async fetchActiveLiveListingItemGroupsByLeague(): Promise<
    LiveListingItemGroup[]
  > {
    const groups: any[] = await this.postgresService.prisma.$queryRaw`
    select "league", "itemGroupHashString", count from (select "league", "itemGroupHashString", count(*) from "PoeLiveListing" psl
    where "listedAtTimestamp" > now() at time zone 'utc' - INTERVAL '8 hour'
    group by "itemGroupHashString", "league") x
    right join "ItemGroupInfo" ig on ig."hashString" = "itemGroupHashString"`;
    return groups;
  }
}

export type LiveListingItemGroup = {
  league: string;
  itemGroupHashString: string;
  count: number;
};

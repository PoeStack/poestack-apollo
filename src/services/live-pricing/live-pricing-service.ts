import { GqlItemGroupListing } from "../../models/basic-models";
import { singleton } from "tsyringe";
import LiveListingService from "./live-listing-service";
import StopWatch from "../../services/utils/stop-watch";
import { Logger } from "../../services/logger";
import _ from "lodash";
import PostgresService from "../../services/mongo/postgres-service";
import { LRUCache } from "lru-cache";

export class LivePricingInput {
  itemGroupHashString?: string | null | undefined;
  quantity?: number | null | undefined;
}

export class LivePricingConfig {
  league: string;
  valuationConfigs: LivePricingValuationConfig[];
}

export class LivePricingValuationConfig {
  listingPercent: number;
  quantity: number;
}

export class LivePricingValuation {
  listingPercent: number;
  quantity: number;

  value: number;
  valueIndex: number;

  validListings: GqlItemGroupListing[];
  validListingsLength: number;
}

export class LivePricingResult {
  allListingsLength: number;
  valuations: LivePricingValuation[];
}

@singleton()
export default class LivePricingService {
  private readonly valuationCache = new LRUCache<string, LivePricingValuation>({
    ttl: 1000 * 60 * 15,

    maxSize: 100_000 * 14,
    sizeCalculation: (value, key) => {
      return (value.validListingsLength ?? 0) + 10;
    },

    updateAgeOnGet: false,
    updateAgeOnHas: false,
  });

  constructor(
    private liveListingService: LiveListingService,
    private postgresService: PostgresService
  ) {}

  public async livePriceSimpleByKey(
    league: string,
    itemGroupKey: string
  ): Promise<LivePricingValuation | null> {
    const cacheKey = `by_key_${league}_${itemGroupKey}`;
    const cachedValuation = this.valuationCache.get(cacheKey);
    if (cachedValuation !== undefined) {
      return cachedValuation;
    }

    const itemGroup = await this.postgresService.prisma.itemGroupInfo.findFirst(
      { where: { key: itemGroupKey }, select: { hashString: true } }
    );
    const result = await this.livePriceSimple(
      { itemGroupHashString: itemGroup.hashString },
      { league: league }
    );

    this.valuationCache.set(cacheKey, !result ? null : result);
    return result;
  }

  public async injectPrices(
    inputs: LivePricingInput[],
    config: { league: string; listingPercent: number }
  ) {
    const sw = new StopWatch(true);
    for (const input of inputs) {
      [
        "lpValue",
        "lpStockValue",
        "fixedValue",
        "totalValueChaos",
        "valueChaos",
      ].forEach((e) => delete input[e]);

      const result = await this.livePrice(input, {
        league: config.league,
        valuationConfigs: [
          { listingPercent: 10, quantity: 1 },
          { listingPercent: config.listingPercent, quantity: 1 },
          {
            listingPercent: config.listingPercent,
            quantity: input.quantity,
          },
        ],
      });

      if (!result || result.allListingsLength <= 9) {
        continue;
      }

      input["fixedValue"] = result.valuations.find(
        (e) => e.listingPercent === 10 && e.quantity === 1
      )?.value;
      input["lpValue"] = result.valuations.find(
        (e) => e.listingPercent === config.listingPercent && e.quantity === 1
      )?.value;
      input["lpStockValue"] = result.valuations.find(
        (e) =>
          e.listingPercent === config.listingPercent &&
          e.quantity === input.quantity
      )?.value;

      //TODO Remove these.
      input["valueChaos"] = input["fixedValue"];
      input["totalValueChaos"] = input["fixedValue"] * input.quantity;
    }
    sw.stop();
    Logger.info("live pricing inject", {
      inputs: inputs.length,
      durationMs: sw.elapsedMS(),
    });
  }

  public async livePriceSimple(
    input: { itemGroupHashString?: string | null | undefined },
    config: { league: string; listingPercent?: number; quantity?: number }
  ): Promise<LivePricingValuation> {
    const valuations = await this.livePrice(
      {
        itemGroupHashString: input.itemGroupHashString,
      },
      {
        league: config.league,
        valuationConfigs: [
          {
            quantity: config.quantity ?? 1,
            listingPercent: config.listingPercent ?? 10,
          },
        ],
      }
    );

    const valuation = valuations.valuations[0];
    return valuation;
  }

  public async livePrice(
    item: { itemGroupHashString?: string | null | undefined },
    config: LivePricingConfig
  ): Promise<LivePricingResult | null> {
    if (
      item?.itemGroupHashString === undefined ||
      item?.itemGroupHashString === null
    ) {
      return null;
    }

    //These listings are sorted by date of listing, with the newest listings first. Outliers have already been filtered
    const allListings = await this.liveListingService.fetchListings({
      itemGroupHashString: item.itemGroupHashString,
      league: config.league,
    });

    const valuationConfigsByQuantity = _.groupBy(
      config.valuationConfigs,
      (e) => e.quantity
    );
    const allValuations = [];
    for (const valuationConfigQuantityGroup of Object.values(
      valuationConfigsByQuantity
    )) {
      const quantity = valuationConfigQuantityGroup[0].quantity;
      const listingPercents = _.uniq(
        valuationConfigQuantityGroup.map((e) => e.listingPercent)
      );

      const valuations = this.extractValuations(
        allListings,
        quantity,
        listingPercents
      );
      allValuations.push(...valuations);
    }

    return {
      allListingsLength: allListings.length,
      valuations: allValuations,
    };
  }

  private extractValuations(
    allListings: GqlItemGroupListing[],
    minQuantity: number,
    listingPercents: number[]
  ): LivePricingValuation[] {
    const effectiveMinQuantity = Math.min(
      Math.max(1, Math.round(minQuantity - Math.max(3, minQuantity * 0.17))),
      25
    );

    //Target all listings within the last hour
    const minDate = Date.now() - 1000 * 60 * 60 * 3;

    //Attempting to find all listings within our quantity bracket within the last hour, but exceed the last hour if we found less than 30 listings
    const validListings = [];
    for (const listing of allListings) {
      if (
        validListings.length >= 450 &&
        listing.listedAtTimestamp.getTime() < minDate
      ) {
        break;
      }

      if (effectiveMinQuantity <= listing.quantity) {
        validListings.push(listing);
      }
    }

    if (validListings.length < 5) {
      return [];
    }

    //Sort by the value to make the target p value easy.
    const sortedListings: GqlItemGroupListing[] = validListings.sort(
      (a, b) => a.listedValue - b.listedValue
    );

    //Filter outlieres
    const low =
      sortedListings[Math.floor(sortedListings.length * 0.03)]?.listedValue;
    const high =
      sortedListings[Math.floor(sortedListings.length * 0.95)]?.listedValue;
    const filteredListings = sortedListings.filter(
      (e) => e.listedValue >= low && e.listedValue <= high
    );

    const results: LivePricingValuation[] = [];
    for (const listingPercent of listingPercents) {
      //Find the index that falls on the p value line.
      const valueLowIndex = Math.floor(
        filteredListings.length * (listingPercent / 100)
      );
      const valueHighIndex = Math.ceil(
        filteredListings.length * (listingPercent / 100)
      );
      const valueLow = filteredListings[valueLowIndex]?.listedValue;
      const valueHigh =
        filteredListings[valueHighIndex]?.listedValue ?? valueLow;
      const valueAvg = (valueLow + valueHigh) / 2;

      if (valueLow) {
        results.push({
          listingPercent: listingPercent,
          quantity: minQuantity,
          validListings: filteredListings,
          validListingsLength: filteredListings.length,
          value: valueAvg,
          valueIndex: valueLowIndex,
        });
      }
    }
    return results;
  }
}

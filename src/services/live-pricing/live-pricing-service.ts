import {
  GqlItemGroupListing,
  GqlLivePricingResult,
  GqlLivePricingValuation,
} from "../../models/basic-models";
import { singleton } from "tsyringe";
import LiveListingService from "./live-listing-service";
import MathUtils from "../../services/utils/math-utils";
import StopWatch from "../../services/utils/stop-watch";
import { Logger } from "../../services/logger";
import _ from "lodash";

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
  constructor(private liveListingService: LiveListingService) {}

  public async injectPrices(
    inputs: LivePricingInput[],
    config: { league: string; listingPercent: number }
  ) {
    const sw = new StopWatch(true);
    for (const input of inputs) {
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

      if (!result) {
        continue;
      }

      input["fixedValue"] = result.valuations.find(
        (e) => e.listingPercent === 10 && e.quantity === 1
      )?.value;
      input["targetValue"] = result.valuations.find(
        (e) => e.listingPercent === config.listingPercent && e.quantity === 1
      )?.value;
      input["stockValue"] = result.valuations.find(
        (e) =>
          e.listingPercent === config.listingPercent &&
          e.quantity === input.quantity
      )?.value;
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
            quantity: config.quantity,
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
    //Target all listings within the last hour
    const minDate = Date.now() - 1000 * 60 * 60 * 2;

    //Attempting to find all listings within our quantity bracket within the last hour, but exceed the last hour if we found less than 30 listings
    let validListings = [];
    for (const listing of allListings) {
      if (
        validListings.length >= 200 &&
        listing.listedAtTimestamp.getTime() < minDate
      ) {
        break;
      }

      if (minQuantity <= listing.quantity) {
        validListings.push(listing);
      }
    }

    const filteredListings = MathUtils.filterOutliersBy(
      validListings,
      (e) => e.listedValue
    );

    //Sort by the value to make the target p value easy.
    const sortedListings: GqlItemGroupListing[] = filteredListings.sort(
      (a, b) => a.listedValue - b.listedValue
    );

    const results: LivePricingValuation[] = [];
    for (const listingPercent of listingPercents) {
      //Find the index that falls on the p value line.
      const valueLowIndex = Math.floor(
        sortedListings.length * (listingPercent / 100)
      );
      const valueHighIndex = Math.ceil(
        sortedListings.length * (listingPercent / 100)
      );
      const valueLow = sortedListings[valueLowIndex]?.listedValue;
      const valueHigh = sortedListings[valueHighIndex]?.listedValue ?? valueLow;
      const valueAvg = (valueLow + valueHigh) / 2;

      if (valueLow) {
        results.push({
          listingPercent: listingPercent,
          quantity: minQuantity,
          validListings: sortedListings.slice(
            Math.max(valueLowIndex - 20, 0),
            Math.min(sortedListings.length - 1, valueLowIndex + 20)
          ),
          validListingsLength: sortedListings.length,
          value: valueAvg,
          valueIndex: valueLowIndex,
        });
      }
    }
    return results;
  }
}

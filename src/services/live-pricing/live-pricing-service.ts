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

export class LivePricingInput {
  itemGroupHashString?: string | null | undefined;
  quantity?: number | null | undefined;
}

export class LivePricingConfig {
  league: string;
  targetPValuePercent: number;
}

@singleton()
export default class LivePricingService {
  constructor(private liveListingService: LiveListingService) {}

  public async injectPrices(
    inputs: LivePricingInput[],
    config: LivePricingConfig
  ) {
    const sw = new StopWatch(true);
    for (const input of inputs) {
      const valuation = await this.livePrice(input, config);
      inputs["targetValue"] = valuation?.genericValuation?.targetValue;
      inputs["baseValue"] = valuation?.genericValuation?.baseValue;
      inputs["stockValue"] = valuation?.stockBasedValuation?.targetValue;
    }
    sw.stop();
    Logger.info("live pricing inject", {
      inputs: inputs.length,
      durationMs: sw.elapsedMS(),
    });
  }

  public async livePrice(
    item: LivePricingInput,
    config: LivePricingConfig
  ): Promise<GqlLivePricingResult | null> {
    if (item.quantity === undefined || item.quantity === null) {
      return null;
    }
    if (
      item.itemGroupHashString === undefined ||
      item.itemGroupHashString === null
    ) {
      return null;
    }

    //These listings are sorted by date of listing, with the newest listings first. Outliers have already been filtered
    const allListings = await this.liveListingService.fetchListings({
      itemGroupHashString: item.itemGroupHashString,
      league: config.league,
    });

    const genericValuation = this.extractValuation(config, allListings, null);

    //config.quantity is the stock items that the person making the price request owns.
    const minQuantity = Math.ceil(item.quantity * 0.9);
    const stockBasedValuation = this.extractValuation(
      config,
      allListings,
      (e: GqlItemGroupListing) => e.quantity >= minQuantity
    );

    return {
      genericValuation: genericValuation,
      stockBasedValuation: stockBasedValuation,
      allListingsLength: allListings.length,
    };
  }

  private extractValuation(
    config: LivePricingConfig,
    allListings: GqlItemGroupListing[],
    filter: ((GqlItemGroupListing) => boolean) | null
  ): GqlLivePricingValuation {
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

      if (!filter || filter(listing)) {
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

    //Find the index that falls on the p value line.
    const targetValueIndex = Math.round(
      sortedListings.length * (config.targetPValuePercent / 100)
    );
    const targetValueListing = sortedListings[targetValueIndex]?.listedValue;
    const targetValueListingPlusOne =
      sortedListings[targetValueIndex + 1]?.listedValue ?? targetValueListing;

    const baseValueIndex = Math.round(sortedListings.length * 0.1);
    const baseValueListing = sortedListings[baseValueIndex]?.listedValue;
    const baseValueListingPlusOne =
      sortedListings[baseValueIndex + 1]?.listedValue ?? baseValueListing;

    return {
      targetValue: (targetValueListing + targetValueListingPlusOne) / 2,
      targetValueIndex: targetValueIndex,
      baseValue: (baseValueListing + baseValueListingPlusOne) / 2,
      baseValueIndex: baseValueIndex,
      validListingsLength: validListings.length,
      validListings: sortedListings.slice(
        Math.max(targetValueIndex - 20, 0),
        Math.min(sortedListings.length - 1, targetValueIndex + 20)
      ),
    };
  }
}

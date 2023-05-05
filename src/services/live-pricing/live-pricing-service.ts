import { S3Service } from "../s3-service";
import { GqlItemGroupListing } from "../../models/basic-models";
import { Logger } from "../logger";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import LiveListingService from "./live-listing-service";

export interface LivePricingConfig {
  league: string;
  itemGroupHashString: string;
  quantity: number;
  targetPValuePercent: number;
}

export interface LivePricingResult {
  value: number;
  listings: GqlItemGroupListing[];
}

@singleton()
export default class LivePricingService {
  constructor(
    private readonly postgresService: PostgresService,
    private s3Service: S3Service,
    private liveListingService: LiveListingService
  ) {}

  public async priceItemGroup(
    config: LivePricingConfig
  ): Promise<LivePricingResult | null> {
    const allListings = await this.liveListingService.fetchListings(config);
    let validListings = allListings;

    //TODO lookback windows;

    if (config.quantity >= 5) {
      validListings = validListings.filter(
        (e) => e.quantity >= config.quantity - 1
      );
    }

    const sortedListings = validListings.sort(
      (a, b) => b.listedValue - a.listedValue
    );

    const targetListing =
      sortedListings[
        Math.floor(sortedListings.length * (config.targetPValuePercent / 100))
      ];

    return { listings: sortedListings, value: targetListing?.listedValue };
  }
}

import { Arg, Ctx, Query, Resolver } from "type-graphql";
import LivePricingService from "../services/live-pricing/live-pricing-service";
import { singleton } from "tsyringe";
import {
  GqlLivePricingSimpleConfig,
  GqlLivePricingResult,
  GqlLivePricingSimpleResult,
} from "../models/basic-models";
import { PoeStackContext } from "../index";

@Resolver()
@singleton()
export class LivePricingResolver {
  constructor(private readonly livePricingService: LivePricingService) {}

  @Query(() => GqlLivePricingSimpleResult)
  public async livePriceSimple(
    @Ctx() ctx: PoeStackContext,
    @Arg("config") config: GqlLivePricingSimpleConfig
  ): Promise<GqlLivePricingSimpleResult> {
    const result = await this.livePricingService.livePrice(config, {
      league: config.league,
      valuationConfigs: [
        { listingPercent: config.listingPercent ?? 10, quantity: 1 },
        {
          listingPercent: config.listingPercent ?? 10,
          quantity: config.quantity,
        },
      ],
    })!;

    const simpleResult: GqlLivePricingSimpleResult = {
      allListingsLength: result.allListingsLength,
      valuation: result.valuations.find((e) => e.quantity === 1),
      stockValuation: result.valuations.find(
        (e) => e.quantity === config.quantity
      ),
    };

    return simpleResult;
  }
}

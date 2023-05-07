import { Arg, Ctx, Query, Resolver } from "type-graphql";
import LivePricingService from "../services/live-pricing/live-pricing-service";
import { singleton } from "tsyringe";
import {
  GqlLivePricingConfig,
  GqlLivePricingResult,
} from "../models/basic-models";
import { PoeStackContext } from "../index";

@Resolver()
@singleton()
export class LivePricingResolver {
  constructor(private readonly livePricingService: LivePricingService) {}

  @Query(() => GqlLivePricingResult)
  public async livePriceItemGroups(
    @Ctx() ctx: PoeStackContext,
    @Arg("config") config: GqlLivePricingConfig
  ): Promise<GqlLivePricingResult> {
    const result: GqlLivePricingResult =
      await this.livePricingService.livePrice(config, config)!;

    return result;
  }
}

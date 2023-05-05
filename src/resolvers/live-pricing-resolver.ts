import { Resolver } from "type-graphql";
import LivePricingService from "../services/live-pricing/live-pricing-service";
import { singleton } from "tsyringe";

@Resolver()
@singleton()
export class PoeResolver {
  constructor(private readonly livePricingService: LivePricingService) {}
}

import { Arg, Ctx, Query, Resolver } from "type-graphql";
import LivePricingService from "../services/live-pricing/live-pricing-service";
import { singleton } from "tsyringe";
import {
  GqlLivePricingSimpleConfig,
  GqlLivePricingSimpleResult,
  GqlLivePricingSummary,
  GqlLivePricingSummaryEntry,
  GqlLivePricingSummarySearch,
} from "../models/basic-models";
import { PoeStackContext } from "../index";
import PostgresService from "../services/mongo/postgres-service";
import { GqlItemGroup } from "../models/basic-models";

@Resolver()
@singleton()
export class LivePricingResolver {
  constructor(
    private readonly livePricingService: LivePricingService,
    private readonly postgresService: PostgresService
  ) {}

  @Query(() => GqlLivePricingSummary)
  public async livePricingSummarySearch(
    @Ctx() ctx: PoeStackContext,
    @Arg("search") search: GqlLivePricingSummarySearch
  ) {
    const itemGroups: GqlItemGroup[] = await this.postgresService.prisma
      .$queryRaw`
      select * from "ItemGroupInfo" i 
      left join "LivePricingHistoryFixedLastEntry" f on i."hashString" = f."itemGroupHashString"
      where f."league" = ${search.league} and i."tag" = ${search.tag} and f."value" is not null
      order by f."value" desc
      offset ${search.offSet} limit 40`;

    const out: GqlLivePricingSummary = { entries: [] };
    for (const itemGroup of itemGroups) {
      const livePriceResult = await this.livePricingService.livePrice(
        {
          itemGroupHashString: itemGroup.hashString,
        },
        {
          league: search.league,
          valuationConfigs: [
            { listingPercent: 10, quantity: 1 },
            { listingPercent: 10, quantity: 20 },
          ],
        }
      );

      const summary: GqlLivePricingSummaryEntry = {
        itemGroup: itemGroup,
        valuation: livePriceResult?.valuations?.[0],
        stockValuation: livePriceResult?.valuations?.[1],
      };

      out.entries.push(summary);
    }

    return out;
  }

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

    simpleResult.valuation.validListings =
      simpleResult.valuation.validListings.slice(0, 10);
    simpleResult.stockValuation.validListings =
      simpleResult.stockValuation.validListings.slice(0, 10);

    return simpleResult;
  }
}

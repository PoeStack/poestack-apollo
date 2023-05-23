import { Arg, Ctx, Query, Resolver } from "type-graphql";
import LivePricingService from "../services/live-pricing/live-pricing-service";
import { singleton } from "tsyringe";
import {
  GqlLivePricingHistoryConfig,
  GqlLivePricingHistoryGroup,
  GqlLivePricingHistoryResult,
  GqlLivePricingHistorySeries,
  GqlLivePricingSimpleConfig,
  GqlLivePricingSimpleResult,
  GqlLivePricingSummary,
  GqlLivePricingSummaryEntry,
  GqlLivePricingSummarySearch,
} from "../models/basic-models";
import { PoeStackContext } from "../index";
import PostgresService from "../services/mongo/postgres-service";
import { GqlItemGroup } from "../models/basic-models";
import _ from "lodash";
import { Prisma } from "@prisma/client";

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
    const searchConditions: Prisma.Sql[] = [
      Prisma.sql`f."league" = ${search.league} and f."value" is not null and f."totalListings" >= 7`,
    ];

    if (search.tag) {
      searchConditions.push(Prisma.sql`i."tag" = ${search.tag}`);
    }
    if (search.searchString) {
      searchConditions.push(
        Prisma.sql`i."key" ilike ${`%${search.searchString}%`}`
      );
    }

    const itemGroups: GqlItemGroup[] = await this.postgresService.prisma
      .$queryRaw`
      select * from "ItemGroupInfo" i 
      left join "LivePricingHistoryFixedLastEntry" f on i."hashString" = f."itemGroupHashString"
      ${Prisma.sql`where ${Prisma.join(searchConditions, " and ")}`}
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
            { listingPercent: 10, quantity: search.quantityMin ?? 20 },
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

  @Query(() => GqlLivePricingHistoryResult)
  public async livePricingHistory(
    @Ctx() ctx: PoeStackContext,
    @Arg("config") config: GqlLivePricingHistoryConfig
  ): Promise<GqlLivePricingHistoryResult> {
    const resultWrapper: GqlLivePricingHistoryResult = {
      results: [],
    };

    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      { where: { hashString: { in: config.itemGroupHashStrings } } }
    );

    const allEntries =
      await this.postgresService.prisma.livePricingHistoryDayEntry.findMany({
        where: {
          itemGroupHashString: { in: config.itemGroupHashStrings },
          minQuantityInclusive: { in: config.minQuantities },
          league: config.league,
          type: { in: config.types },
        },
        orderBy: { timestamp: "asc" },
      });

    const entriesByItemgroupHash = _.groupBy(
      allEntries,
      (e) => e.itemGroupHashString
    );
    for (const itemGroup of itemGroups) {
      const resultGroup: GqlLivePricingHistoryGroup = {
        itemGroup: itemGroup as unknown as GqlItemGroup,
        series: [],
      };
      resultWrapper.results.push(resultGroup);

      const entriesByTypeAndQuantity = _.groupBy(
        entriesByItemgroupHash[itemGroup.hashString],
        (e) => `${e.type}__${e.minQuantityInclusive}`
      );

      for (const type of config.types) {
        for (const minQuantity of config.minQuantities) {
          const series: GqlLivePricingHistorySeries = {
            type: type,
            stockRangeStartInclusive: minQuantity,
            entries: entriesByTypeAndQuantity[`${type}__${minQuantity}`] ?? [],
          };
          resultGroup.series.push(series);
        }
      }
    }

    return resultWrapper;
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
    });

    const simpleResult: GqlLivePricingSimpleResult = {
      allListingsLength: result.allListingsLength,
      valuation: result.valuations.find((e) => e.quantity === 1),
      stockValuation: result.valuations.find(
        (e) => e.quantity === config.quantity
      ),
    };

    if (simpleResult.valuation) {
      simpleResult.valuation.validListings =
        simpleResult.valuation.validListings.slice(0, 10);
    }

    if (simpleResult.stockValuation) {
      simpleResult.stockValuation.validListings =
        simpleResult.stockValuation.validListings.slice(0, 10);
    }

    return simpleResult;
  }
}

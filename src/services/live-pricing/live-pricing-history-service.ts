import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import LivePricingService, {
  LivePricingValuationConfig,
} from "./live-pricing-service";
import { Logger } from "../../services/logger";
import { LivePricingHistoryHourEntry } from "@prisma/client";

@singleton()
export default class LivePricingHistoryService {
  constructor(
    private readonly postgresService: PostgresService,
    private livePricingService: LivePricingService,
  ) {}

  //Shard item groups as well?

  public async updateHistory(activeItemGroup: {
    league: string;
    itemGroupHashString: string;
  }) {
    const valuationConfigs: LivePricingValuationConfig[] = [];

    for (const listingPercent of [5, 10, 15, 20, 30, 50]) {
      for (const quantity of [1, 10, 30, 70, 200, 500, 1000, 10000]) {
        valuationConfigs.push({
          listingPercent: listingPercent,
          quantity: quantity,
        });
      }
    }

    const results = await this.livePricingService.livePrice(
      {
        itemGroupHashString: activeItemGroup.itemGroupHashString,
      },
      {
        league: activeItemGroup.league,
        valuationConfigs: valuationConfigs,
      }
    );

    const updatedAtEpochMs = Date.now();
    const hourlyTimestamp = new Date(
      updatedAtEpochMs - (updatedAtEpochMs % 3600000)
    );

    const hourlyEntires: LivePricingHistoryHourEntry[] = [];
    for (const valuation of results.valuations) {
      hourlyEntires.push({
        itemGroupHashString: activeItemGroup.itemGroupHashString,
        league: activeItemGroup.league,
        type: `lp${valuation.listingPercent}`,
        value: valuation.value,
        minQuantityInclusive: valuation.quantity,
        timestamp: hourlyTimestamp,
      });
    }
    hourlyEntires.push({
      itemGroupHashString: activeItemGroup.itemGroupHashString,
      league: activeItemGroup.league,
      type: `totalListings`,
      value: results.allListingsLength,
      minQuantityInclusive: 1,
      timestamp: hourlyTimestamp,
    });

    await this.postgresService.prisma.livePricingHistoryHourEntry.createMany({
      skipDuplicates: true,
      data: hourlyEntires,
    });
  }

  public async startBackgroundJob() {
    for (;;) {
      try {
        const activeItemGroups = await this.fetchPublicStashActiveItemGroups();
        for (const activeItemGroup of activeItemGroups) {
          try {
            await this.updateHistory(activeItemGroup);
          } catch (error) {
            Logger.error("live pricing history error", { error: error });
          }
        }
      } catch (error) {
        Logger.error("live pricing history error", { error: error });
      }
    }
  }

  private async fetchPublicStashActiveItemGroups(): Promise<ActiveItemGroup[]> {
    const groups: any[] = await this.postgresService.prisma.$queryRaw`
    select "league", "itemGroupHashString", count from (select "league", "itemGroupHashString", count(*) from "PoeLiveListing" psl
    group by "itemGroupHashString", "league") x
    right join "ItemGroupInfo" ig on ig."hashString" = "itemGroupHashString"
    where count >= 6`;
    return groups;
  }
}

export type ActiveItemGroup = {
  league: string;
  itemGroupHashString: string;
  count: number;
};

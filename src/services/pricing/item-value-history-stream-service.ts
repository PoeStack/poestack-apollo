import _ from "lodash";

import MathUtils from "../utils/math-utils";
import StopWatch from "../utils/stop-watch";
import DiscordService from "../discord-service";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import { Logger } from "../logger";
import GithubService from "../github-service";

export type ActiveItemGroup = {
  league: string;
  itemGroupHashString: string;
  count: number;
};

@singleton()
export default class ItemValueHistoryStreamService {
  constructor(
    private readonly discordService: DiscordService,
    private readonly postgresService: PostgresService,
    private readonly githubService: GithubService
  ) {}

  private async fetchPublicStashActiveItemGroups(): Promise<ActiveItemGroup[]> {
    const groups: any[] = await this.postgresService.prisma.$queryRaw`
    select "league", "itemGroupHashString", count from (select "league", "itemGroupHashString", count(*) from "PoeLiveListing" psl
    group by "itemGroupHashString", "league") x
    right join "ItemGroupInfo" ig on ig."hashString" = "itemGroupHashString"`;
    return groups;
  }

  private async runDailyInsert() {
    const activeItemGroups = await this.fetchPublicStashActiveItemGroups();

    let groupsWrote = 0;
    for (const group of activeItemGroups) {
      try {
        await this.updateDailyTimeseries(group);
      } catch (error) {
        Logger.error("error updating daily timeseries", error);
      }
      groupsWrote++;
    }

    try {
      await this.postgresService.prisma.$executeRaw`
    delete from "ItemGroupPValueHourlyTimeseriesEntry"
    where "timestamp" < now() at time zone 'utc' - INTERVAL '5 day'`;
    } catch (error) {
      Logger.error("error deleting hourly timeseries", error);
    }
  }

  public async updateDailyTimeseries(group: ActiveItemGroup) {
    const daily: any[] = await this.postgresService.prisma.$queryRaw`
    select date_trunc('day', e."timestamp") as timestamp, e."hashString", e."type", "stockRangeStartInclusive", avg(value) as value, e."league" as "league" from "ItemGroupPValueHourlyTimeseriesEntry" e
    where e."hashString" = ${group.itemGroupHashString} and e."league" = ${group.league} and "timestamp" > date_trunc('day', now() at time zone 'utc' - INTERVAL '24 hour')
    group by date_trunc('day', e."timestamp"), e."hashString", e."type", "stockRangeStartInclusive", e."league"`;

    for (const chunk of _.chunk(daily, 17)) {
      const promises = chunk.map(async (p) => {
        return await this.postgresService.prisma.itemGroupPValueDailyTimeseriesEntry.upsert(
          {
            where: {
              hashString_type_stockRangeStartInclusive_timestamp_league: {
                hashString: p.hashString,
                type: p.type.toString(),
                stockRangeStartInclusive: p.stockRangeStartInclusive,
                timestamp: p.timestamp,
                league: group.league,
              },
            },
            create: p,
            update: p,
          }
        );
      });
      await Promise.all(promises);
    }
  }

  private findListingLookbackWindow(
    listings: { q: number; p: number; t: Date }[]
  ): number | null {
    let lookbackWindowHours = null;

    const now = new Date();
    const allWindows = [24, 12, 8, 6, 4, 2];
    for (const windowHours of allWindows) {
      const filterTime = now.getTime() - 1000 * 60 * 60 * windowHours;
      const listingCountInWindow = listings.reduce(
        (p, c) => p + (c.t.getTime() >= filterTime ? 1 : 0),
        0
      );

      if (
        (windowHours === allWindows[0] && listingCountInWindow >= 5) ||
        listingCountInWindow >= 45
      ) {
        lookbackWindowHours = windowHours;
      } else {
        break;
      }
    }

    return lookbackWindowHours;
  }

  private async writeHourlyItemGroupSummary(activeItemGroup: ActiveItemGroup) {
    const sw = new StopWatch();
    sw.start("overall");

    sw.start("pull");
    const listings: { q: number; p: number; t: Date }[] = await this
      .postgresService.prisma.$queryRaw`
        select
          sum("quantity") as q,
          avg("listedValue") as p,
          max("listedAtTimestamp") as t
        from
          "PoeLiveListing"
        where
          "itemGroupHashString" = ${activeItemGroup.itemGroupHashString} and "league" = ${activeItemGroup.league}
        group by
          "poeProfileName"`;
    sw.stop("pull");

    const lookbackWindowHours = this.findListingLookbackWindow(listings);
    if (lookbackWindowHours) {
      const updatedAtEpochMs = Date.now();
      const hourlyEpochMs = updatedAtEpochMs - (updatedAtEpochMs % 3600000);

      const itemGroupPValues = [];
      const rangeStarts = [0, 9, 18, 30, 50, 100, 500, 1000, 10000, 30000];
      let lastPValueGroup = null;
      for (const rangeStart of rangeStarts) {
        const pValues = this.buildTimeSeriesEntries(
          listings,
          rangeStart,
          lastPValueGroup
        ).map(([type, value]) => ({
          league: activeItemGroup.league,
          hashString: activeItemGroup.itemGroupHashString,
          type: type,
          value: Number(value),
          stockRangeStartInclusive: rangeStart,
          updatedAtTimestamp: new Date(updatedAtEpochMs),
          lookbackWindowUsedHours: lookbackWindowHours,
        }));
        lastPValueGroup = pValues;
        itemGroupPValues.push(...pValues);
      }

      //TODO remove total quanity and total listings from the above make a seperate query for it to avoid lookback window affect

      const hourlyPValues = itemGroupPValues.map((e) => ({
        league: activeItemGroup.league,
        hashString: e.hashString,
        type: e.type,
        value: e.value,
        stockRangeStartInclusive: e.stockRangeStartInclusive,
        timestamp: new Date(hourlyEpochMs),
      }));

      if (itemGroupPValues.length > 0) {
        sw.start("write p values");
        let promises = itemGroupPValues.map(async (p) => {
          await this.postgresService.prisma.itemGroupPValue.upsert({
            where: {
              hashString_type_stockRangeStartInclusive_league: {
                hashString: p.hashString,
                type: p.type.toString(),
                stockRangeStartInclusive: p.stockRangeStartInclusive,
                league: activeItemGroup.league,
              },
            },
            update: p as any,
            create: p as any,
          });
        });
        await Promise.all(promises);
        sw.stop("write p values");

        sw.start("write hourly p values");
        promises = hourlyPValues.map(async (p) => {
          await this.postgresService.prisma.itemGroupPValueHourlyTimeseriesEntry.upsert(
            {
              where: {
                hashString_type_stockRangeStartInclusive_timestamp_league: {
                  hashString: p.hashString,
                  type: p.type.toString(),
                  stockRangeStartInclusive: p.stockRangeStartInclusive,
                  timestamp: p.timestamp,
                  league: activeItemGroup.league,
                },
              },
              update: p as any,
              create: p as any,
            }
          );
        });
        await Promise.all(promises);
        sw.stop("write hourly p values");
      }
    }

    sw.stop("overall");
    Logger.debug(
      `evaluated ${listings.length} listings in ${sw.elapsedMS(
        "overall"
      )}ms [pull ${sw.elapsedMS("pull")}ms write ${sw.elapsedMS(
        "write p values"
      )}ms hourly ${sw.elapsedMS("write hourly p values")}ms]`
    );
  }

  private async runHourlyInsert(): Promise<number> {
    try {
      await this.postgresService.prisma.$executeRaw`
      delete from "PoeLiveListing" psl where "listedAtTimestamp" < now() at time zone 'utc' - INTERVAL '24 hour'`;

      const activeItemGroups: ActiveItemGroup[] =
        await this.fetchPublicStashActiveItemGroups();

      let itemGroupsWroteCount = 0;
      for (const group of activeItemGroups) {
        //FOR CPU
        await new Promise((res) => setTimeout(res, 15));
        itemGroupsWroteCount++;

        await this.writeHourlyItemGroupSummary(group);

        if (itemGroupsWroteCount % 10000 === 0) {
          this.discordService.ping(
            `hourly write progress ${+(
              (itemGroupsWroteCount / activeItemGroups.length) *
              100
            ).toFixed(0)}%`
          );
        }
      }

      return activeItemGroups.length;
    } catch (error) {
      Logger.error("error during history write", error);
    }

    return -1;
  }

  public async startHistoryInserts() {
    let hourlyWrites = 0;

    for (;;) {
      try {
        const sw = new StopWatch();

        sw.start("hourly");
        const hourlyGroupsWritten = await this.runHourlyInsert();
        sw.stop("hourly");
        hourlyWrites++;
        await this.discordService.ping(
          `history bulk write ${sw.dump(
            "hourly"
          )} wrote ${hourlyGroupsWritten} groups. ${hourlyWrites} completed in a row`
        );

        try {
          if (global.gc) {
            global.gc();
            this.discordService.ping("ran gc");
          }
        } catch (e) {
          Logger.error("error in gc", e);
        }

        await new Promise((res) => setTimeout(res, 1000 * 60));

        if (hourlyWrites % 2 === 0) {
          this.discordService.ping("starting daily history bulk write.");
          sw.start("daily");
          await this.runDailyInsert();
          sw.stop("daily");
          this.discordService.ping(
            `daily history bulk write ${sw.dump("daily")}.`
          );
        }

        if (hourlyWrites % 2 === 0) {
          await this.uploadPriceDataToGithub();
        }
      } catch (error) {
        this.discordService.ping(`history write error ${error.message}`);
      }
    }
  }

  public async uploadPriceDataToGithub() {
    const leagues: { league: string }[] = await this.postgresService.prisma
      .$queryRaw`select distinct "league" from "ItemGroupPValue"`;

    for (const league of leagues.map((e) => e.league)) {
      if (league === "NA") continue;

      const tags: { type: string }[] = await this.postgresService.prisma
        .$queryRaw`
        select distinct "type" from "ItemGroupPValue" p
        right join "ItemGroupInfo" i on p."hashString" = i."hashString"
        where "league" = ${league} and p."updatedAtTimestamp" > now() at time zone 'utc' - INTERVAL '2 day'`;

      for (const type of tags.map((e) => e.type)) {
        const rows: any[] = await this.postgresService.prisma.$queryRaw`
          select "key", "tag", "properties", "type", "stockRangeStartInclusive", "value" from "ItemGroupPValue" p
          right join "ItemGroupInfo" i on p."hashString" = i."hashString"
          where "league" = ${league} and "type" = ${type}`;

        const csv = rows
          .map((v) =>
            [
              `"${v.key?.replaceAll("\n", "")}"`,
              v.tag,
              `"${JSON.stringify(v.properties).replaceAll('"', '""')}"`,
              v.type,
              v.stockRangeStartInclusive,
              v.value,
            ].join(",")
          )
          .join("\n");

        await this.githubService.uploadContentToFile(
          `poe/leagues/${league}/economy/pvalue_${type}.csv`,
          csv,
          `update ${league} ${type} pricing data.`
        );
      }
    }
  }

  private buildTimeSeriesEntries(
    allListings: Array<{ p: number; q: number }>,
    minStackSize = 0,
    lastPValues: { type: string; value: number }[] | null
  ): Array<Array<string | number>> {
    const allValues = allListings
      .filter((l) => {
        return l.q > minStackSize;
      })
      .map((l) => l.p);

    const filteredChaosValues = MathUtils.filterOutliers(allValues);
    if (filteredChaosValues.length === 0) {
      return [];
    }

    const results = [
      ["totalValidListings", filteredChaosValues.length],
      ["totalQuantity", _.sumBy(allListings, (e) => e.q)],
      ["p5", MathUtils.q(filteredChaosValues, 0.05)],
      ["p7", MathUtils.q(filteredChaosValues, 0.07)],
      ["p10", MathUtils.q(filteredChaosValues, 0.1)],
      ["p15", MathUtils.q(filteredChaosValues, 0.15)],
      ["p20", MathUtils.q(filteredChaosValues, 0.2)],
      ["p50", MathUtils.q(filteredChaosValues, 0.5)],
    ].filter((e) => e[1] !== undefined);

    if (lastPValues) {
      for (const res of results) {
        if ((res[0] as string).startsWith("p")) {
          const lastPValue = lastPValues?.find((e) => e.type === res[0]);
          if (lastPValue) {
            res[1] = Math.max(lastPValue.value, res[1] as number);
          }
        }
      }
    }

    return results;
  }
}

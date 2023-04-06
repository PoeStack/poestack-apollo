import { Arg, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";
import ItemGroupService from "../services/item-group-service";
import {
  type GqlItemGroupValueTimeseries,
  type GqlItemGroupValueTimeseriesGroupSeries,
  GqlItemGroupValueTimeseriesResult,
  GqlItemGroupValueTimeseriesSearch,
} from "../models/basic-models";
import _ from "lodash";

@Resolver()
@singleton()
export class ItemGroupValueTimeseriesResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly itemGroupService: ItemGroupService
  ) {}

  @Query(() => GqlItemGroupValueTimeseriesResult)
  async itemGroupValueTimeseriesSearch(
    @Arg("search") search: GqlItemGroupValueTimeseriesSearch
  ) {
    const itemGroups = await this.itemGroupService.search(
      search.itemGroupSearch
    );

    const table =
      search.bucketType === "hourly"
        ? this.postgresService.prisma.itemGroupPValueHourlyTimeseriesEntry
        : this.postgresService.prisma.itemGroupPValueDailyTimeseriesEntry;

    const minTimestamp =
      search.bucketType === "hourly"
        ? new Date(Date.now() - 1000 * 60 * 60 * 48)
        : new Date(Date.now() - 1000 * 60 * 60 * 24 * 14);

    const timeseriesValues = await table.findMany({
      where: {
        hashString: { in: itemGroups.map((e) => e.hashString) },
        league: search.itemGroupSearch.league,
        type: { in: search.seriesTypes },
        stockRangeStartInclusive: { in: search.stockStartingRanges },
        timestamp: { gte: minTimestamp },
      },
    });

    const timeseriesValuesGroupedByItemHash = _.groupBy(
      timeseriesValues,
      (e) => e.hashString
    );

    const timeseries: GqlItemGroupValueTimeseries[] = [];
    for (const itemGroup of itemGroups) {
      const groupSeries: GqlItemGroupValueTimeseries = {
        itemGroup,
        series: [],
      };
      const groupedByType = _.groupBy(
        timeseriesValuesGroupedByItemHash[itemGroup.hashString],
        (e) => e.type
      );

      for (const type of Object.keys(groupedByType)) {
        const groupedByStock = _.groupBy(
          groupedByType[type],
          (e) => e.stockRangeStartInclusive
        );
        for (const stockRangeStart of Object.keys(groupedByStock)) {
          const series: GqlItemGroupValueTimeseriesGroupSeries = {
            type,
            stockRangeStartInclusive: parseInt(stockRangeStart),
            entries: groupedByStock[stockRangeStart]
              .map((e) => ({
                timestamp: e.timestamp,
                value: e.value,
              }))
              .sort(
                (a, b) =>
                  (a.timestamp?.valueOf() ?? 0) - (b.timestamp?.valueOf() ?? 0)
              ),
          };
          groupSeries.series.push(series);
        }
      }

      timeseries.push(groupSeries);
    }

    const resp: GqlItemGroupValueTimeseriesResult = { results: timeseries };
    return resp;
  }
}

import _ from "lodash";

import ItemGroupingService from "./item-grouping-service";
import NodeCache from "node-cache";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import {
  type GqlStashSnapshotItemGroupSummary,
  GqlDetachedStashSnapshotInput,
} from "../../models/basic-models";

@singleton()
export default class ItemValueHistoryService {
  private readonly pValueCache = new NodeCache();

  constructor(
    private readonly itemGroupingService: ItemGroupingService,
    private readonly postgresService: PostgresService
  ) {}

  public async fetchFirstPValueByItemGroupHashKey(
    league: string,
    itemGroupHashKey: string,
    targetPValue: string = "p10"
  ): Promise<number | null> {
    const cacheKey = `${league}__${itemGroupHashKey}`;
    const cacheValue: number = this.pValueCache.get(cacheKey);
    if (cacheValue !== undefined) {
      return cacheValue;
    }

    const itemGroup = await this.postgresService.prisma.itemGroupInfo.findFirst(
      {
        where: { key: itemGroupHashKey },
      }
    );

    const pValueResult =
      await this.postgresService.prisma.itemGroupPValue.findFirst({
        where: {
          hashString: itemGroup?.hashString,
          type: targetPValue,
          league: league,
        },
      });

    const pValue = pValueResult?.value;
    this.pValueCache.set(cacheKey, pValue ?? null, 60 * 10);
    return pValue;
  }

  public async fetchFirstPValueByItemGroupHashString(
    itemGroupHashString: string
  ): Promise<number | null> {
    const cacheKey = `string__${itemGroupHashString}`;
    const cacheValue: number = this.pValueCache.get(cacheKey);
    if (cacheValue !== undefined) {
      return cacheValue;
    }

    const pValueResult =
      await this.postgresService.prisma.itemGroupPValue.findFirst({
        where: { hashString: itemGroupHashString, type: "p10" },
      });

    const pValue = pValueResult?.value;
    this.pValueCache.set(cacheKey, pValue ?? null, 60 * 10);
    return pValue;
  }

  public async injectItemPValue(
    items: { itemGroupHashString: string; quantity: number }[],
    options: {
      league: string;
      valuationTargetPValue: string;
      valuationStockInfluence: string;
    }
  ) {
    const itemsWithItemGroup = items.filter((e) => !!e.itemGroupHashString);

    const allItemGroupHashStrings = itemsWithItemGroup.map(
      (i) => i.itemGroupHashString
    );

    const pValueTarget = options?.valuationTargetPValue ?? "p10";
    const itemGroupPValues =
      await this.postgresService.prisma.itemGroupPValue.findMany({
        where: {
          type: pValueTarget,
          league: options.league,
          hashString: { in: allItemGroupHashStrings },
        },
      });

    const groupPValues = _.groupBy(itemGroupPValues, (e) => e.hashString);
    for (const item of itemsWithItemGroup) {
      const pValues = groupPValues[item.itemGroupHashString];
      if (pValues) {
        let selectedPValue = pValues.find(
          (e) => e.stockRangeStartInclusive === 0 && e.type === pValueTarget
        )?.value;

        if (options?.valuationStockInfluence === "smart-influence") {
          const sortedPValues = pValues
            .filter((e) => e.type === pValueTarget)
            .sort(
              (a, b) => a.stockRangeStartInclusive - b.stockRangeStartInclusive
            );
          for (const pValue of sortedPValues) {
            if (pValue.stockRangeStartInclusive < item.quantity) {
              selectedPValue = pValue.value;
            }
          }
        }

        item["valueChaos"] = selectedPValue ?? 0;
        item["totalValueChaos"] = selectedPValue * item.quantity;
      }
    }
  }
}

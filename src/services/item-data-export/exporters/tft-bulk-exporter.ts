import type ItemGroupExporter from "../item-group-exporter";
import ItemGroupExporterService from "../item-group-exporter-service";
import {
  type GqlStashSnapshotItemGroupSummarySearch,
  type GqlItemGroup,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotExport,
  GqlStashSnapshot,
} from "../../../models/basic-models";

export default class TftBulkExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    search.tags = [exportedData.input.exportType];
  }

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    const commonPricingData =
      ItemGroupExporterService.getCommonPricings(exportedData);

    const divRatio = +exportedData.divineChaosValue.toFixed(1);

    const summaries = exportedData.itemGroupSummaries as any as Array<
      GqlStashSnapshotItemGroupSummary & {
        itemGroup: GqlItemGroup;
      }
    >;

    const mostValuable = summaries
      .slice(0, 4)
      .map((i) => i.itemGroup.key)
      .join(", ");

    return `WTS ${snapshot.league}
IGN: ${exportedData.input.ign}
PoeStack price: ${commonPricingData.totalValueChaos} :chaos: ( ${
      commonPricingData.totalValueDiv
    } :divine: ) at ratio [${divRatio}:chaos:/1:divine:]
Asking price: ${commonPricingData.listedValueChaos} :chaos: (${
      Math.round(exportedData.input.listedValueMultiplier * 100)
    }% of PoeStack price) ( ${
      commonPricingData.listedValueDiv
    } :divine:) at ratio [${divRatio}:chaos:/1:divine:] 
Most valuable: ${mostValuable}`;
  }

  async toRawLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ): Promise<string> {
    return "";
  }
}

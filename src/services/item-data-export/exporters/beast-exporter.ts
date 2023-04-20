import type ItemGroupExporter from "../item-group-exporter";

import ItemGroupExporterService from "../item-group-exporter-service";
import {
  GqlStashSnapshot,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
} from "../../../models/basic-models";

export default class BeastExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    search.tags = ["beast"];
  }

  filterItems(exportedData: GqlStashSnapshotExport) {}

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    let header = `WTS ${
      snapshot.league?.includes("Hardcore") ? "Hardcore " : "Softcore "
    }Beasts${
      exportedData.input.ign?.length ? ` | IGN: ${exportedData.input.ign}` : ""
    }`;

    if (exportedData.divineChaosValue > 0) {
      const val = +exportedData.divineChaosValue.toFixed(0);
      header += ` | :divine: = ${val} :chaos:`;
    }

    for (const item of exportedData.itemGroupSummaries) {
      const valueChaos =
        Math.round(
          item.valueChaos * exportedData.input.listedValueMultiplier * 2
        ) / 2;
      const totalValueChaos = valueChaos * item.quantity;

      const totalValue = ItemGroupExporterService.chaosValueToPriceString(
        exportedData,
        totalValueChaos
      );

      const line = `\n${item.quantity}x ${
        item.itemGroup.key
      } ${valueChaos}c / each${
        item.quantity > 1 ? ` (${totalValue} all)` : ""
      }`;

      if (
        !exportedData?.input?.oneClickPost ||
        header.length + line.length < 1880
      ) {
        header += line;
      }
    }

    return header;
  }

  async toRawLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ): Promise<string> {
    return "";
  }
}

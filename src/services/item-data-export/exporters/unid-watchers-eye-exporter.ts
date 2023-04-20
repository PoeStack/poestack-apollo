import type ItemGroupExporter from "../item-group-exporter";
import ItemGroupExporterService from "../item-group-exporter-service";
import {
  type GqlStashSnapshotItemGroupSummarySearch,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotExport,
  GqlStashSnapshot,
} from "../../../models/basic-models";

export default class UnidWatchersEyeExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    search.keys = ["unidentified watcher's eye"];
  }

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    return `WTS ${
      snapshot.league?.includes("Hardcore") ? "Hardcore " : "Softcore "
    } | IGN: ${exportedData.input.ign}`;
  }

  async toRawLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ): Promise<string> {
    const ilvl = item.itemGroup.properties.find((e) => e.key === "ilvl")?.value;
    const totalValue = ItemGroupExporterService.chaosValueToPriceString(
      exportedData,
      item.totalValueChaos
    );
    return `\n${
      item.quantity
    }x  lvl ${ilvl} unidentified watcher's eye(s) / ${+item.valueChaos.toFixed(
      1
    )}c each (${totalValue} all)`;
  }
}

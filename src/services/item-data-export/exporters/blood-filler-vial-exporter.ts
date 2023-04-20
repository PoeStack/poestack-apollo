import type ItemGroupExporter from "../item-group-exporter";
import ItemGroupExporterService from "../item-group-exporter-service";
import {
  type GqlStashSnapshotItemGroupSummarySearch,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotExport,
  GqlStashSnapshot,
} from "../../../models/basic-models";

export default class BloodFilledVialExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    search.keys = ["blood-filled vessel"];
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
    const mosterLvl = item.itemGroup.properties.find(
      (e) => e.key === "monsterLvl"
    )?.value;
    const totalValue = ItemGroupExporterService.chaosValueToPriceString(
      exportedData,
      item.totalValueChaos
    );
    return `\n${
      item.quantity
    }x  lvl ${mosterLvl} blood-filled vessel(s) / ${+item.valueChaos.toFixed(
      1
    )}c each (${totalValue} all)`;
  }
}

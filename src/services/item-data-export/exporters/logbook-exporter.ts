import type ItemGroupExporter from "../item-group-exporter";
import _ from "lodash";
import {
  GqlStashSnapshot,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
} from "../../../models/basic-models";

export default class LogbookExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    search.tags = ["logbook"];
  }

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    const summaries = exportedData.itemGroupSummaries;

    let result = `WTS ${
      snapshot.league?.includes("Hardcore") ? "Hardcore " : "Softcore "
    }Logbooks (no corrupted, no split) | IGN: ${
      exportedData.input.ign
    }`;

    const groups = _.sortBy(
      Object.values(_.groupBy(summaries, (i) => i.itemGroup.key)),
      (i) => i?.[0].valueChaos
    ).reverse();

    for (const group of groups) {
      const lines = [];
      let groupTotalValue = 0;
      for (const item of _.sortBy(group, (g) => g.totalValueChaos).reverse()) {
        const corrupted = (item.itemGroup.properties as any[]).find(
          (p) => p.key === "corrupted"
        ).value;
        const split = (item.itemGroup.properties as any[]).find(
          (p) => p.key === "split"
        ).value;

        if (!corrupted && !split) {
          const ilvl = (item.itemGroup.properties as any[]).find(
            (p) => p.key === "ilvl"
          ).value;
          const listedValueChaos =
            Math.round(
              item.valueChaos * exportedData.input.listedValueMultiplier * 2
            ) / 2;
          groupTotalValue += listedValueChaos * item.quantity;

          lines.push(
            `x${item.quantity} lvl ${ilvl} ${item.itemGroup.key} ${listedValueChaos}c each`
          );
        }
      }
      lines.unshift(
        `\n\n--${group[0].itemGroup.key} ${groupTotalValue.toFixed(
          0
        )} :chaos: all--`
      );
      result += lines.join("\n");
    }

    return result;
  }

  async toRawLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ): Promise<string> {
    return "";
  }
}

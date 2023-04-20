import type ItemGroupExporter from "../item-group-exporter";

import _ from "lodash";
import {
  GqlStashSnapshot,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
} from "../../../models/basic-models";

export default class HeistExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {
    search.tags = ["contract", "blueprint"];
  }

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    let result = `WTS ${
      snapshot.league?.includes("Hardcore") ? "Hardcore " : "Softcore "
    } (no corrupted) | IGN: ${
      exportedData.input.ign
    }`;

    const contractGroups = _.sortBy(
      Object.values(
        _.groupBy(
          (exportedData.itemGroupSummaries as any[]).filter(
            (i) => i.itemGroup.tag === "contract"
          ),
          (i) => i.itemGroup.key
        )
      ),
      (i) => i?.[0].valueChaos
    ).reverse();

    const blueprintGroups = _.sortBy(
      Object.values(
        _.groupBy(
          (exportedData.itemGroupSummaries as any[]).filter(
            (i) => i.itemGroup.tag === "blueprint"
          ),
          (i) => i.itemGroup.key
        )
      ),
      (i) => i?.[0].valueChaos
    ).reverse();

    for (const blueprints of blueprintGroups) {
      const lines = [];
      let totalChaosValue = 0;
      for (const blueprint of blueprints) {
        const ilvl = blueprint.itemGroup.properties.find(
          (p) => p.key === "ilvl"
        ).value;
        const totalWings = blueprint.itemGroup.properties.find(
          (p) => p.key === "totalWings"
        ).value;
        const fullyRevealed = blueprint.itemGroup.properties.find(
          (p) => p.key === "fullyRevealed"
        ).value;

        totalChaosValue +=
          blueprint.totalValueChaos * exportedData.input.listedValueMultiplier;
        lines.push(
          `x${blueprint.quantity} lvl ${ilvl} ${totalWings} wings${
            fullyRevealed ? " fully revealed" : ""
          } ${blueprint.itemGroup.key} ${+(
            blueprint.valueChaos * exportedData.input.listedValueMultiplier
          ).toFixed(1)}c each`
        );
      }
      lines.unshift(
        `\n\n--${blueprints[0].itemGroup.key} ${totalChaosValue.toFixed(
          0
        )} :chaos: all--`
      );

      const joinedLine = lines.join("\n");
      if (
        !exportedData?.input?.oneClickPost ||
        result.length + joinedLine.length < 1880
      ) {
        result += joinedLine;
      }
    }

    for (const contracts of contractGroups) {
      const lines = [];
      let totalChaosValue = 0;
      for (const contract of contracts) {
        const ilvl = contract.itemGroup.properties.find(
          (p) => p.key === "ilvl"
        ).value;

        totalChaosValue +=
          contract.totalValueChaos * exportedData.input.listedValueMultiplier;
        lines.push(
          `x${contract.quantity} lvl ${ilvl} ${contract.itemGroup.key} ${+(
            contract.valueChaos * exportedData.input.listedValueMultiplier
          ).toFixed(1)}c each`
        );
      }
      lines.unshift(
        `\n\n--${contracts[0].itemGroup.key} ${totalChaosValue.toFixed(
          0
        )} :chaos: all--`
      );

      const joinedLine = lines.join("\n");
      if (
        !exportedData?.input?.oneClickPost ||
        result.length + joinedLine.length < 1700
      ) {
        result += joinedLine;
      }
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

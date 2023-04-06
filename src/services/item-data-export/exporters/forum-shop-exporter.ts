import type ItemGroupExporter from "../item-group-exporter";
import {
  GqlStashSnapshot,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
} from "../../../models/basic-models";

export default class ForumShopExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {}

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    return ``;
  }

  async toRawLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ): Promise<string> {
    let lines = "";
    const specialGroupTags = [
      "logbook",
      "gem",
      "blueprint",
      "contract",
      "cluster",
      "compass",
      "map",
    ];

    const specialListing = specialGroupTags.includes(item?.itemGroup?.tag);
    const stashLocations: any[] = specialListing
      ? item.stashLocations
      : item.stashLocations.slice(0, 1);

    for (const stashLocation of stashLocations) {
      const index = stashLocation.flatIndex + 1;

      let listedSizing = 1;
      if (!specialListing) {
        if (exportedData.input.maxStackSizeSetting === "max") {
          listedSizing = item.quantity;
        } else if (
          exportedData.input.maxStackSizeSetting === "stack" &&
          item.itemGroup.inventoryMaxStackSize > 0
        ) {
          listedSizing = Math.min(
            item.itemGroup.inventoryMaxStackSize,
            item.quantity
          );
        } else if (
          exportedData.input.maxStackSizeSetting === "full inventory" &&
          item.itemGroup.inventoryMaxStackSize > 0
        ) {
          listedSizing = Math.min(
            item.itemGroup.inventoryMaxStackSize * 60,
            item.quantity
          );
        }
      }

      let totalListedValue =
        listedSizing *
        item.valueChaos *
        exportedData.input.listedValueMultiplier;
      const sizingFragment = listedSizing > 1 ? `/${listedSizing}` : "";
      let listedCurrenyType = "chaos";

      if (
        !exportedData.input.alwaysPriceInChaos &&
        exportedData.divineChaosValue > 1 &&
        totalListedValue > exportedData.divineChaosValue
      ) {
        totalListedValue = +(
          totalListedValue / exportedData.divineChaosValue
        ).toFixed(1);
        listedCurrenyType = "divine";
      } else {
        totalListedValue = +totalListedValue.toFixed(1);
      }

      lines += `[linkItem location="Stash${
        index + (exportedData.input.stashIndexOffset ?? 0)
      }" league="${snapshot.league}" x="${stashLocation.x}" y="${
        stashLocation.y
      }"] ~b/o ${totalListedValue}${sizingFragment} ${listedCurrenyType}\n`;
    }

    return lines;
  }
}

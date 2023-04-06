import type ItemGroupExporter from "../item-group-exporter";
import {
  GqlStashSnapshot,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
} from "../../../models/basic-models";

export default class CsvExporter implements ItemGroupExporter {
  updateSearch(
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) {}

  async toHeaderLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ): Promise<string> {
    return "key,tag,valueChaos,quantity,totalValueChaos";
  }

  async toRawLine(
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ): Promise<string> {
    // todo expand this to invlude hash props, add a json export
    return `\n${item.itemGroup.key},${item.itemGroup.tag},${item.valueChaos},${item.quantity},${item.totalValueChaos}`;
  }
}

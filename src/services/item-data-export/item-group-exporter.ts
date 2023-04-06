import {
  GqlStashSnapshot,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotItemGroupSummary,
  type GqlStashSnapshotItemGroupSummarySearch,
} from "../../models/basic-models";

export default interface ItemGroupExporter {
  toHeaderLine: (
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport
  ) => Promise<string>;

  toRawLine: (
    snapshot: GqlStashSnapshot,
    exportedData: GqlStashSnapshotExport,
    item: GqlStashSnapshotItemGroupSummary
  ) => Promise<string>;

  filterItems?: (exportedData: GqlStashSnapshotExport) => any;

  updateSearch?: (
    exportedData: GqlStashSnapshotExport,
    search: GqlStashSnapshotItemGroupSummarySearch
  ) => any;
}

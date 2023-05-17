import { GqlItemGroup } from "../../models/basic-models";

export interface StashViewItemEntry {
  x: number;
  y: number;
  quantity: number;
}

export interface StashViewTrackedItemEntry extends StashViewItemEntry {
  itemGroupHashString: string;
  fixedValue: number;
  lpValue: number;
  lpStockValue: number;

  valueChaos: number;
  totalValueChaos: number;
}

export interface StashViewUntrackedItemEntry extends StashViewItemEntry {
  searchableString: string;
  icon: string;
}

export interface StashViewSnapshotValuations {
  fixedValue: number;
  lpValue: number;
  lpStockValue: number;
}

export interface StashViewSnapshotHeader {
  userId: string;
  timestamp: Date;
  totalValues: StashViewSnapshotValuations;
  totalValuesByTab: Record<string, StashViewSnapshotValuations>;
}

export interface StashViewSnapshotGrouped {
  timestamp: Date;
  entriesByTab: Record<string, StashViewTrackedItemEntry[]>;
}

export interface StashViewSnapshotItemGroups {
  timestamp: Date;
  itemGroups: GqlItemGroup[];
}

export interface StashViewSnapshotUntracked {
  timestamp: Date;
  entriesByTab: Record<string, StashViewUntrackedItemEntry[]>;
}

export interface StashViewTab {
  id: string;
  parent: string;
  color: string;
  folder: boolean;
  name: string;
  type: string;
  index: number;
  flatIndex: number;
}

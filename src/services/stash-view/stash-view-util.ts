import {
  GqlStashViewItemSummary,
  GqlStashViewSettings,
  GqlStashViewStashSummary,
} from "./../../models/basic-models";
import { STASH_VIEW_TFT_CATEGORIES } from "./stash-view-tft-categories";

export class StashViewUtil {
  public static smartLimitOutput(
    limit: number,
    header: string | null,
    body: string[],
    footer: string | null,
    buffer: number = 450,
    joiner: string = "\n"
  ): string {
    let size = (header?.length ?? 0) + (footer?.length ?? 0) + buffer;
    const out: string[] = [];
    if (header?.length ?? 0 > 0) {
      out.push(header!);
    }
    for (const line of body) {
      if (size + line.length + joiner.length < limit) {
        out.push(line);
        size += line.length + joiner.length;
      }
    }
    if (footer?.length ?? 0 > 0) {
      out.push(footer);
    }
    return out.join(joiner);
  }

  public static itemValue(
    settings: GqlStashViewSettings,
    item: GqlStashViewItemSummary
  ): number {
    let value = item.valueChaos ?? 0;

    if (settings.valueOverridesEnabled) {
      const overrideValue =
        settings.itemGroupValueOverrides[item.itemGroupHashString ?? ""];
      if (overrideValue !== undefined && overrideValue !== null) {
        value = overrideValue;
      }
    }

    if (["TFT-Bulk", "Forum Shop"].includes(settings.selectedExporter)) {
      value = value * ((settings.exporterListedValueMultipler ?? 100) / 100);
    }

    return value;
  }

  public static itemStackTotalValue(
    settings: GqlStashViewSettings,
    item: GqlStashViewItemSummary
  ): number {
    return StashViewUtil.itemValue(settings, item) * item.quantity;
  }

  public static searchItems(
    settings: GqlStashViewSettings,
    summary: GqlStashViewStashSummary,
    reduceStack: boolean = false
  ): GqlStashViewItemSummary[] {
    const filters: ((item: GqlStashViewItemSummary) => boolean)[] = [
      (e) =>
        settings.searchString.trim().length === 0 ||
        e.searchableString.includes(settings.searchString.toLowerCase()),
      (e) =>
        (!settings.minItemQuantity || settings.minItemQuantity <= e.quantity) &&
        (!settings.minItemStackValue ||
          settings.minItemStackValue <
            StashViewUtil.itemStackTotalValue(settings, e)) &&
        (!settings.minItemValue ||
          settings.minItemValue < StashViewUtil.itemValue(settings, e)),
      (e) =>
        !settings.excludedItemGroupIds ||
        !e.itemGroupHashString ||
        !settings.excludedItemGroupIds.includes(e.itemGroupHashString),
      (e) => {
        if (
          settings.selectedExporter === "TFT-Bulk" &&
          settings.tftSelectedCategory
        ) {
          const category =
            STASH_VIEW_TFT_CATEGORIES[settings.tftSelectedCategory!]!;
          if (category && category.filter && !category.filter(e)) {
            return false;
          }

          return (
            !settings.checkedTags ||
            settings.checkedTags.some((t) => t === e.itemGroupTag)
          );
        }
        return true;
      },
    ];

    const prefilter = [...summary.items].filter(
      (e) =>
        !settings.filterCheckedTabs ||
        settings.checkedTabIds.includes(e.stashId)
    );

    const result = (
      reduceStack ? StashViewUtil.reduceItemStacks(prefilter) : prefilter
    ).filter((e) => filters.every((f) => f(e)));
    return result;
  }

  private static reduceItemStacks(
    items: GqlStashViewItemSummary[]
  ): GqlStashViewItemSummary[] {
    const groups: Record<string, GqlStashViewItemSummary> = {};
    for (const item of items) {
      if (item.itemGroupHashString) {
        let group = groups[item.itemGroupHashString];
        if (!group) {
          group = { ...item };
          groups[item.itemGroupHashString] = group;
        } else {
          group.quantity += item.quantity;
        }
      }
    }
    return Object.values(groups);
  }
}

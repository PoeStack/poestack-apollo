import {
  GqlStashViewStashSummary,
  GqlPoeStashTab,
  GqlStashViewSettings,
  GqlStashViewItemSummary,
  GqlItemGroup,
} from "models/basic-models";
import { GeneralUtils } from "../../utils/general-util";
import { StashViewUtil } from "./stash-view-util";

export class StashViewExporters {
  public static exportTftCompassesBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    let output: string[] = [];

    const mapped: (GqlStashViewItemSummary & { itemGroup: GqlItemGroup })[] =
      StashViewUtil.reduceItemStacks(
        StashViewUtil.searchItems(stashSettings, summary).filter(
          (e) => !!e.valueChaos && []
        )
      ).map((e: GqlStashViewItemSummary & { itemGroup: GqlItemGroup }) => {
        e.itemGroup = summary.itemGroups.find(
          (g) => e.itemGroupHashString === g.hashString
        );
        return e;
      });

    const filteredItems = mapped.sort(
      (a, b) =>
        StashViewUtil.itemValue(stashSettings, b) -
        StashViewUtil.itemValue(stashSettings, a)
    );
    for (const item of filteredItems) {
      output.push(
        `${item.quantity}x ${
          item.itemGroup.displayName
        } ${StashViewUtil.itemValue(
          stashSettings,
          item
        )} :chaos: / each (${StashViewExporters.chaosToDivPlusChaos(
          stashSettings.chaosToDivRate,
          StashViewUtil.itemStackTotalValue(stashSettings, item)
        )} all)`
      );
    }

    const header = `WTS Softcore Compasses | IGN: ${stashSettings.ign} | :divine: = ${stashSettings.chaosToDivRate} :chaos:`;
    return StashViewUtil.smartLimitOutput(3000, header, output, null, 100);
  }

  public static exportTftGenericBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    const filteredItems = StashViewUtil.searchItems(stashSettings, summary)
      .filter((e) => !!e.valueChaos)
      .sort(
        (a, b) =>
          StashViewUtil.itemValue(stashSettings, b) -
          StashViewUtil.itemValue(stashSettings, a)
      );

    let totalValue = 0;
    let totalListedValue = 0;
    let output: string[] = [];
    for (const item of filteredItems) {
      const itemValue = StashViewUtil.itemValue(stashSettings, item);
      totalValue += item.valueChaos ?? 0;
      totalListedValue += itemValue;
    }

    const header = `WTS ${stashSettings.league}\nIGN ${
      stashSettings.ign
    }\nPoeStack Price: ${Math.round(
      totalValue
    )} :chaos: (${StashViewExporters.chaosToDivPlusChaos(
      stashSettings.chaosToDivRate!,
      totalValue
    )}) at ratio [${GeneralUtils.roundToFirstNoneZeroN(
      stashSettings.chaosToDivRate!
    )} :chaos: / 1 :divine:]\nAsking Price: ${Math.round(
      totalListedValue
    )} :chaos: (${StashViewExporters.chaosToDivPlusChaos(
      stashSettings.chaosToDivRate!,
      totalListedValue
    )}) ${stashSettings.exporterListedValueMultipler!}% of PoeStack Price at ratio [${GeneralUtils.roundToFirstNoneZeroN(
      stashSettings.chaosToDivRate!
    )} :chaos: / 1 :divine:]`;

    return StashViewUtil.smartLimitOutput(3000, header, output, null, 100);
  }

  public static chaosToDivPlusChaos(
    divRate: number,
    totalChaos: number
  ): string {
    const div = Math.floor(totalChaos / divRate);
    const divMsg = `${Math.floor(totalChaos / divRate)} :divine: + `;
    return (
      (div > 0 ? divMsg : "") + `${Math.round(totalChaos % divRate)} :chaos:`
    );
  }
}

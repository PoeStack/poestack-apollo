import {
  GqlStashViewStashSummary,
  GqlPoeStashTab,
  GqlStashViewSettings,
  GqlStashViewItemSummary,
  GqlItemGroup,
} from "models/basic-models";
import { GeneralUtils } from "../../utils/general-util";
import { StashViewUtil } from "./stash-view-util";
import _ from "lodash";

export class StashViewExporters {

  public static exportTftCompassesBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    let output: string[] = [];

    const filteredItems: GqlStashViewItemSummary[] =
      StashViewUtil.reduceItemStacks(
        StashViewUtil.searchItems(stashSettings, summary).filter(
          (e) => !!e.valueChaos
        )
      ).sort(
        (a, b) =>
          StashViewUtil.itemStackTotalValue(stashSettings, b) -
          StashViewUtil.itemStackTotalValue(stashSettings, a)
      );

    for (const item of filteredItems) {
      let line = `${item.quantity}x ${
        item.itemGroup.displayName
      } ${StashViewExporters.chaosToDivPlusChaos(
        stashSettings.chaosToDivRate,
        StashViewUtil.itemValue(stashSettings, item),
        false
      )} / each`;

      if (item.quantity > 1) {
        line += ` (${StashViewExporters.chaosToDivPlusChaos(
          stashSettings.chaosToDivRate,
          StashViewUtil.itemStackTotalValue(stashSettings, item),
          false
        )} all)`;
      }

      output.push(line);
    }

    const header = `WTS Softcore Compasses | IGN: ${stashSettings.ign} | :divine: = ${stashSettings.chaosToDivRate} :chaos:`;
    return StashViewUtil.smartLimitOutput(
      2000,
      header,
      output,
      null,
    );
  }

  public static exportTftHeistBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    const mapped: GqlStashViewItemSummary[] = StashViewUtil.reduceItemStacks(
      StashViewUtil.searchItems(stashSettings, summary).filter(
        (e) => !!e.valueChaos
      )
    );

    const output = [];

    const contractGroups = _.sortBy(
      Object.values(
        _.groupBy(
          mapped.filter((i) => i.itemGroup.tag === "contract"),
          (i) => i.itemGroup.key
        )
      ),
      (i) => i?.[0].valueChaos
    ).reverse();

    const blueprintGroups = _.sortBy(
      Object.values(
        _.groupBy(
          mapped.filter((i) => i.itemGroup.tag === "blueprint"),
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

        totalChaosValue += StashViewUtil.itemStackTotalValue(
          stashSettings,
          blueprint
        );
        lines.push(
          `x${blueprint.quantity} lvl ${ilvl} ${totalWings} wings${
            fullyRevealed ? " fully revealed" : ""
          } ${blueprint.itemGroup.key} ${+StashViewUtil.itemStackTotalValue(
            stashSettings,
            blueprint
          ).toFixed(1)}c each`
        );
      }
      lines.unshift(
        `\n--${blueprints[0].itemGroup.key} ${totalChaosValue.toFixed(
          0
        )} :chaos: all--`
      );
      output.push(lines.join("\n"));
    }

    for (const contracts of contractGroups) {
      const lines = [];
      let totalChaosValue = 0;
      for (const contract of contracts) {
        const ilvl = contract.itemGroup.properties.find(
          (p) => p.key === "ilvl"
        ).value;

        totalChaosValue += StashViewUtil.itemStackTotalValue(
          stashSettings,
          contract
        );
        lines.push(
          `x${contract.quantity} lvl ${ilvl} ${
            contract.itemGroup.key
          } ${+StashViewUtil.itemStackTotalValue(
            stashSettings,
            contract
          ).toFixed(1)}c each`
        );
      }
      lines.unshift(
        `\n--${contracts[0].itemGroup.key} ${totalChaosValue.toFixed(
          0
        )} :chaos: all--`
      );

      output.push(lines.join("\n"));
    }

    const header = `WTS Softcore (no corrupted) | IGN: ${stashSettings.ign}`;
    return StashViewUtil.smartLimitOutput(
      2000,
      header,
      output,
      null
    );
  }

  public static exportLogbooksBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    const mapped: GqlStashViewItemSummary[] = StashViewUtil.reduceItemStacks(
      StashViewUtil.searchItems(stashSettings, summary).filter(
        (e) => !!e.valueChaos
      )
    );

    const groups = _.sortBy(
      Object.values(_.groupBy(mapped, (i) => i.itemGroup.key)),
      (i) => i?.[0].valueChaos
    ).reverse();

    const output = [];
    for (const group of groups) {
      const lines = [];
      let groupTotalValue = 0;
      for (const item of _.sortBy(group, (g) =>
        StashViewUtil.itemStackTotalValue(stashSettings, g)
      ).reverse()) {
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

          groupTotalValue += StashViewUtil.itemStackTotalValue(
            stashSettings,
            item
          );

          lines.push(
            `x${item.quantity} lvl ${ilvl} ${
              item.itemGroup.key
            } ${StashViewUtil.itemValue(stashSettings, item)}c each`
          );
        }
      }
      lines.unshift(
        `\n--${group[0].itemGroup.key} ${StashViewExporters.chaosToDivPlusChaos(
          stashSettings.chaosToDivRate,
          groupTotalValue
        )} all--`
      );

      output.push(lines.join("\n"));
    }

    const header = `WTS ${
      stashSettings.league?.includes("Hardcore") ? "Hardcore " : "Softcore "
    }Logbooks (no corrupted, no split) | IGN: ${stashSettings.ign}`;
    return StashViewUtil.smartLimitOutput(
      2000,
      header,
      output,
      null
    );
  }

  public static exportTftBeastBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    const mapped: GqlStashViewItemSummary[] = StashViewUtil.reduceItemStacks(
      StashViewUtil.searchItems(stashSettings, summary).filter(
        (e) => !!e.valueChaos
      )
    ).sort(
      (a, b) =>
        StashViewUtil.itemValue(stashSettings, b) -
        StashViewUtil.itemValue(stashSettings, a)
    );

    const output = [];
    for (const item of mapped) {
      output.push(
        `${item.quantity}x ${GeneralUtils.capitalize(
          item.searchableString
        )} ${StashViewExporters.chaosToDivPlusChaos(
          stashSettings.chaosToDivRate,
          StashViewUtil.itemValue(stashSettings, item)
        )} each (${StashViewExporters.chaosToDivPlusChaos(
          stashSettings.chaosToDivRate,
          StashViewUtil.itemStackTotalValue(stashSettings, item)
        )} all)`
      );
    }

    const header = `WTS Softcore`;
    const footer = `IGN ${stashSettings.ign}`;
    return StashViewUtil.smartLimitOutput(
      2000,
      header,
      output,
      footer
    );
  }

  public static exportTftGenericBulk(
    summary: GqlStashViewStashSummary,
    tabs: GqlPoeStashTab[],
    stashSettings: GqlStashViewSettings
  ): string {
    const filteredItems = StashViewUtil.reduceItemStacks(
      StashViewUtil.searchItems(stashSettings, summary).filter(
        (e) => !!e.valueChaos
      )
    ).sort(
      (a, b) =>
        StashViewUtil.itemStackTotalValue(stashSettings, b) -
        StashViewUtil.itemStackTotalValue(stashSettings, a)
    );

    let totalValue = 0;
    let totalListedValue = 0;
    let output: string[] = [];
    for (const item of filteredItems) {
      totalValue += (item.valueChaos ?? 0) * item.quantity;
      totalListedValue += StashViewUtil.itemStackTotalValue(
        stashSettings,
        item
      );
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
    )} :chaos: / 1 :divine:]\nMost Valuable: ${filteredItems
      .slice(0, 5)
      .map((e) => GeneralUtils.capitalize(e.searchableString))
      .join(", ")}`;

    return StashViewUtil.smartLimitOutput(
      2000,
      header,
      output,
      null
    );
  }

  public static chaosToDivPlusChaos(
    divRate: number,
    totalChaos: number,
    useEmotes: boolean = true
  ): string {
    if (totalChaos < divRate) {
      return `${GeneralUtils.roundToFirstNoneZeroN(totalChaos!)}${
        useEmotes ? " :chaos:" : "c"
      }`;
    }

    const div = Math.floor(totalChaos / divRate);
    const divMsg = `${Math.floor(totalChaos / divRate)}${
      useEmotes ? " :divine:" : " div"
    } + `;
    return (
      (div > 0 ? divMsg : "") +
      `${Math.round(totalChaos % divRate)}${useEmotes ? ":chaos:" : "c"}`
    );
  }
}
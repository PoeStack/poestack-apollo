import { singleton } from "tsyringe";
import fs from "fs";
import _ from "lodash";
import objectHash from "object-hash";

@singleton()
export class RePoeService {
  private modTextToIdsMapping = {};
  private modToStatMapping = {};

  public baseToItemClassMapping = {};
  public baseToItemTagMapping = {};

  private loadBaseToItemClassMapping() {
    const baseItems = JSON.parse(
      fs.readFileSync(`data/poe/re_poe/base_items.json`).toString()
    );

    for (const item of Object.values(baseItems)) {
      this.baseToItemClassMapping[item["name"]?.toLowerCase()] =
        item["item_class"]?.toLowerCase();
      this.baseToItemTagMapping[item["name"]?.toLowerCase()] = item["tags"];
    }
  }

  private loadModTextToIdsMapping() {
    const statTranslations = JSON.parse(
      fs.readFileSync(`data/poe/re_poe/stat_translations.json`).toString()
    );
    const textIdPairs = [];
    for (const x of Object.values(statTranslations)) {
      const modIds = x["ids"];
      const textKeys = x["English"].map((e) =>
        e["string"]
          ?.toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/[0-9]/g, "")
          .replace(/  +/g, " ")
          .trim()
      );
      for (const id of modIds) {
        for (const textKey of textKeys) {
          textIdPairs.push([textKey, id]);
        }
      }
    }

    for (const [textKey, poeId] of textIdPairs) {
      const ids = this.modTextToIdsMapping[textKey] || [];
      ids.push(poeId);
      this.modTextToIdsMapping[textKey] = _.uniq(ids);
    }
  }

  private loadModMapping() {
    const allMods = JSON.parse(
      fs.readFileSync(`data/poe/re_poe/mods.json`).toString()
    );

    for (const mod of Object.values(allMods)) {
      for (const stat of mod["stats"] || []) {
        const stats = this.modToStatMapping[stat.id] || [];
        stats.push(stat);
        const u = _.uniqBy(stats, (a) => objectHash(a as object));
        this.modToStatMapping[stat.id] = _.sortBy(u, ["max", "min"]).reverse();
      }
    }
  }

  public getModFromDisplayText(
    displayText: string
  ): { id: string; min: number; max: number; nTier: number } | null {
    const modIds: string[] =
      this.modTextToIdsMapping[
        displayText
          ?.toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/[0-9]/g, "")
          .replace(/  +/g, " ")
          .trim()
      ];
    const values: number[] = displayText
      .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g)
      ?.map((e) => +e);

    if (modIds && values?.length) {
      const lastValue = values[values.length - 1];
      const stats = modIds?.flatMap((e) => this.modToStatMapping[e] ?? []);
      const selectedStatIndex = stats?.findIndex(
        (s) => s.min <= lastValue && lastValue <= s.max
      );
      if (stats[selectedStatIndex]) {
        return {
          ...stats[selectedStatIndex],
          nTier: selectedStatIndex / stats.length,
        };
      }
    }

    return null;
  }

  public load() {
    this.loadBaseToItemClassMapping();
    /*     this.loadModMapping();
    this.loadModTextToIdsMapping(); */
  }
}

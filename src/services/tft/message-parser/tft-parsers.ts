import { CompassGroupIdentifier } from "./../../pricing/item-grouping-service";
import { GeneralUtils } from "../../../utils/general-util";

export class TftParsers {
  public static parseCompasses(content: string): any {
    const body = content.toLocaleLowerCase();
    const lines = body.split("\n");

    const ign = lines[0]
      .match(/ign: (\S*)/g)?.[0]
      .slice("ign: ".length)
      .replaceAll("`", "");
    if (!ign) {
      throw new Error("Missing IGN");
    }

    const res = { ign: ign, compasses: {} };
    const divRate = parseInt(
      GeneralUtils.extractNumber(lines[0], null, [
        "c",
        "chaos",
        "<:chaos:951514139610738728>",
      ])
    );
    if (!divRate) {
      throw new Error("Missing Div Rate");
    }

    for (const line of lines.slice(1)) {
      const compass = Object.values(
        CompassGroupIdentifier.DISPLAY_OVERRIDES
      ).find((e) => line.includes(e.toLowerCase()));

      const quantity = parseInt(line.split("x")[0]);

      const vDiv = parseFloat(
        GeneralUtils.extractNumber(line.split("/")[0], null, [
          "div",
          "divine",
          "<:divine:666765844541603861>",
        ])
      );
      const vChaos = parseFloat(
        GeneralUtils.extractNumber(line.split("/")[0], null, [
          "c",
          "chaos",
          "<:chaos:951514139610738728>",
        ])
      );

      const value =
        divRate * (Number.isNaN(vDiv) ? 0 : vDiv) +
        (Number.isNaN(vChaos) ? 0 : vChaos);

      if (!value) {
        continue;
      }
      res.compasses[compass] = {
        quantity: quantity,
        value: value,
      };
    }

    return res;
  }

  public static parseFiveWay(content: string): {
    priceDiv: number;
    runs: number;
    currentClients: number;
    maxClients: number;
    currentResetters: number;
    maxResetters: number;
    currentAurabots: number;
    maxAurabots: number;
    kills: number;
    regions: string[];
    ign: string;
  } {
    const body = content.toLocaleLowerCase();
    const lines = body.split("\n");

    const priceDiv = GeneralUtils.extractNumber(lines[2], null, [
      "div",
      "divine",
      "<:divine:666765844541603861>",
    ]);
    const runs = GeneralUtils.extractNumber(lines[2], null, ["run"]);
    const clients = GeneralUtils.extractNumber(
      lines[4],
      ["client"],
      null
    ).split("/");
    const resetters = GeneralUtils.extractNumber(
      lines[4],
      ["resetter"],
      null
    ).split("/");
    const aurabots = GeneralUtils.extractNumber(
      lines[4],
      ["aurabot"],
      null
    ).split("/");
    const kills = GeneralUtils.extractNumber(
      lines[3]?.replaceAll(",", "")?.replaceAll(".", ""),
      null,
      ["kill"]
    );

    const regions = [];
    ["na", "kr", "sg", "jp", "eu", "ru", "ch"].forEach((e) => {
      if (lines[1].includes(e)) {
        regions.push(e);
      }
    });

    const ign = lines[5]
      .match(/@(\S*)/g)?.[0]
      ?.slice(1)
      .replaceAll("`", "");

    const result = {
      priceDiv: parseFloat(priceDiv),
      runs: parseInt(runs),
      currentClients: parseInt(clients[0]),
      maxClients: parseInt(clients[1]),
      currentResetters: parseInt(resetters[0]),
      maxResetters: parseInt(resetters[1]),
      currentAurabots: parseInt(aurabots[0]),
      maxAurabots: parseInt(aurabots[1]),
      kills: kills ? parseInt(kills) : undefined,
      regions: regions,
      guarantee: lines[3]
        .replaceAll("guarantees:", "")
        .replaceAll("guaranteess:", "")
        .replaceAll("*", "")
        .trim(),
      ign: ign,
    };

    function verify(keys: string[]) {
      for (const key of keys) {
        if (
          result[key] === undefined ||
          result[key] === null ||
          Number.isNaN(result[key])
        ) {
          throw new Error(`Missing ${key}.`);
        }
      }
    }

    verify([
      "ign",
      "priceDiv",
      "runs",
      "currentClients",
      "maxClients",
      "currentResetters",
      "maxResetters",
      "currentAurabots",
      "maxAurabots",
    ]);

    if (
      result.currentClients === result.maxClients &&
      result.currentAurabots === result.maxAurabots &&
      result.currentResetters === result.maxResetters
    ) {
      throw new Error("Party already full.");
    }

    return result;
  }
}

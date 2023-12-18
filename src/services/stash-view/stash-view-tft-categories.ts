import { StashViewUtil } from "./stash-view-util";
import { GqlStashViewItemSummary } from "../../models/basic-models";
import { StashViewExporters } from "./stash-view-exporters";

export interface TftCategory {
  tags: string[];
  export: any;
  enableOverrides?: boolean;
  channels: Record<
    string,
    { channelId: string; timeout: number; disableImages?: boolean }
  >;
  filter?: (item: GqlStashViewItemSummary) => boolean;
}

export const STASH_VIEW_TFT_CATEGORIES: Record<string, TftCategory> = {
  compasses: {
    tags: ["compass"],
    export: StashViewExporters.exportTftCompassesBulk,
    enableOverrides: true,
    channels: {
      Affliction: {
        channelId: "939791301371654185",
        timeout: 900,
        disableImages: true,
      },
      Standard: {
        channelId: "945390356286038076",
        timeout: 900,
        disableImages: true,
      },
    },
    filter: (item) =>
      ["4", "16"].includes(
        `${item.itemGroup?.properties?.find((e) => e["key"] === "uses")?.value}`
      ),
  },
  "essence high": {
    tags: ["essence"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "874662778592460851", timeout: 900 } },
    filter: (item) =>
      [
        "shrieking",
        "deafening",
        "hysteria",
        "insanity",
        "horror",
        "delirium",
      ].some(
        (s) => !!StashViewUtil.itemEntryToName(item)?.toLowerCase()?.includes(s)
      ),
  },
  essence: {
    tags: ["essence"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "874662778592460851", timeout: 900 } },
  },
  heist: {
    tags: ["contract", "blueprint"],
    enableOverrides: true,
    export: StashViewExporters.exportTftHeistBulk,
    channels: {
      Affliction: {
        channelId: "973701260781969418",
        timeout: 900,
        disableImages: true,
      },
      Standard: {
        channelId: "961952547680161832",
        timeout: 900,
        disableImages: true,
      },
    },
  },
  currency: {
    tags: ["currency"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: {
      Affliction: {
        channelId: "904002942884003870",
        timeout: 900,
      },
    },
  },
  beast: {
    tags: ["beast"],
    enableOverrides: true,
    export: StashViewExporters.exportTftBeastBulk,
    channels: {
      Affliction: {
        channelId: "874661938032943134",
        timeout: 900,
        disableImages: true,
      },
      Standard: {
        channelId: "961952092514304020",
        timeout: 900,
        disableImages: true,
      },
    },
  },
  fossil: {
    tags: ["fossil"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "874663081400209499", timeout: 900 } },
  },
  delve: {
    tags: ["fossil", "resonator"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "874663081400209499", timeout: 900 } },
  },
  scarabs: {
    tags: ["scarab"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: {
      Affliction: { channelId: "1185693650433364018", timeout: 900 },
      Standard: { channelId: "961952608757624842", timeout: 900 },
    },
  },
  catalysts: {
    tags: ["catalyst"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "874663181258211358", timeout: 900 } },
  },
  fragments: {
    tags: ["fragment"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "906960098088341505", timeout: 900 } },
  },
  cards: {
    tags: ["card"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "882247835188346951", timeout: 900 } },
  },
  tattoos: {
    tags: ["tattoo"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "1144748831670546542", timeout: 900 } },
  },
  "delirium orbs": {
    tags: ["delirium orb"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "882251982830731315", timeout: 900 } },
  },
  breach: {
    tags: ["breach"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "874671016100659280", timeout: 900 } },
  },
  logbooks: {
    tags: ["logbook"],
    enableOverrides: true,
    export: StashViewExporters.exportLogbooksBulk,
    channels: {
      Affliction: {
        channelId: "868188612376809513",
        timeout: 900,
        disableImages: true,
      },
    },
  },
  oils: {
    tags: ["oil"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "882600782199914496", timeout: 900 } },
  },
  incubators: {
    tags: ["incubator"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { Affliction: { channelId: "882247870143692800", timeout: 900 } },
  },
};

import { StashViewExporters } from "./stash-view-exporters";

export interface TftCategory {
  tags: string[];
  export: any;
  channels: Record<string, { channelId: string, timeout: number, disableImages?: boolean }>
}

export const STASH_VIEW_TFT_CATEGORIES: Record<string, TftCategory> = {
  compasses: {
    tags: ["compass"],
    export: StashViewExporters.exportTftCompassesBulk,
    channels: { 'Crucible': { channelId: '939791301371654185', timeout: 900, disableImages: true } }
  },
  essence: {
    tags: ["essence"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '874662778592460851', timeout: 900 } }
  },
  fossils: {
    tags: ["fossil"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '874663081400209499', timeout: 900 } }
  },
  scarabs: {
    tags: ["scarab"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '874669036863094804', timeout: 900 } }
  },
  catalysts: {
    tags: ["catalyst"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '874663181258211358', timeout: 900 } }
  },
  fragments: {
    tags: ["fragment"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '906960098088341505', timeout: 900 } }
  },
  cards: {
    tags: ["card"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '882247835188346951', timeout: 900 } }
  },
  "delirium orbs": {
    tags: ["delirium orb"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '882251982830731315', timeout: 900 } }
  },
  oils: {
    tags: ["oil"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '882600782199914496', timeout: 900 } }
  },
  incubators: {
    tags: ["incubator"],
    export: StashViewExporters.exportTftGenericBulk,
    channels: { 'Crucible': { channelId: '882247870143692800', timeout: 900 } }
  },
};

import { nanoid } from "nanoid";
import ItemValueHistoryService from "../pricing/item-value-history-service";
import StashSnapshotService from "../snapshot/snapshot-service";
import CsvExporter from "./exporters/csv-exporter";
import CompassExporter from "./exporters/compass-exporter";
import type ItemGroupExporter from "./item-group-exporter";
import ForumShopExporter from "./exporters/forum-shop-exporter";
import LogbookExporter from "./exporters/logbook-exporter";
import TftBulkExporter from "./exporters/tft-bulk-exporter";
import HeistExporter from "./exporters/heist-exporter";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";

import { StashSnapshot } from "@prisma/client";
import {
  GqlStashSnapshotItemGroupSummarySearchResponse,
  type GqlStashSnapshotExport,
  type GqlStashSnapshotExportInput,
} from "../../models/basic-models";
import UnidWatchersEyeExporter from "./exporters/unid-watchers-eye-exporter";
import BloodFilledVialExporter from "./exporters/blood-filler-vial-exporter";
import DiscordService from "../discord-service";
import TftService from "../tft-service";
import BeastExporter from "./exporters/beast-exporter";

@singleton()
export default class ItemGroupExporterService {
  private readonly exporters: Record<string, ItemGroupExporter> = {
    csv: new CsvExporter(),
    compass: new CompassExporter(),
    "forum shop": new ForumShopExporter(),
    logbook: new LogbookExporter(),
    essence: new TftBulkExporter(),
    scarab: new TftBulkExporter(),
    fossil: new TftBulkExporter(),
    catalyst: new TftBulkExporter(),
    beast: new BeastExporter(),
    fragment: new TftBulkExporter(),
    card: new TftBulkExporter(),
    "delirium orb": new TftBulkExporter(),
    oil: new TftBulkExporter(),
    incubator: new TftBulkExporter(),
    resonator: new TftBulkExporter(),
    artifacts: new TftBulkExporter(),
    heist: new HeistExporter(),
    "unidentified watcher's eyes": new UnidWatchersEyeExporter(),
    "blood-filled vessels": new BloodFilledVialExporter(),
  };

  constructor(
    private readonly snapshotService: StashSnapshotService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly postgresService: PostgresService,
    private readonly discordService: DiscordService,
    private readonly tftService: TftService
  ) {}

  public async exportItemData(
    userId: string,
    input: GqlStashSnapshotExportInput
  ): Promise<GqlStashSnapshotExport> {
    const exporter = this.exporters[input.exportType];

    input.search.limit = 10000;
    input.search.skip = 0;

    const exportedData: GqlStashSnapshotExport = {
      id: nanoid(),
      userId,
      createdAtTimestamp: new Date(),
      exportRaw: "",
      totalValueChaos: 0,

      itemGroupSummaries: [],

      divineChaosValue: 0,

      input,
    };

    exporter.updateSearch(exportedData, input.search);

    const stashSnapshot: StashSnapshot =
      await this.snapshotService.fetchSnapshot(input.search?.snapshotId);
    const searchResp: GqlStashSnapshotItemGroupSummarySearchResponse =
      await this.snapshotService.fetchStashSnapshotItemSummaries(input.search);

    const divChaosValue =
      await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
        stashSnapshot.league,
        "divine orb"
      );

    exportedData.totalValueChaos = 0;
    exportedData.itemGroupSummaries = searchResp.itemGroupSummaries;
    exportedData.divineChaosValue = divChaosValue;
    exporter.filterItems?.(exportedData);
    const itemSummaries = exportedData.itemGroupSummaries;
    itemSummaries.forEach((i) => {
      const overrideValue = exportedData.input.itemGroupValueOverrides?.find(
        (o) => o.itemGroupHashString === i.itemGroupHashString
      );
      if (overrideValue !== null && overrideValue !== undefined) {
        i.valueChaos = overrideValue.valueChaos;
        i.totalValueChaos = i.valueChaos * i.quantity;
      }
      exportedData.totalValueChaos += i.totalValueChaos;
    });
    exportedData.totalValueChaos = Math.round(exportedData.totalValueChaos);

    let allRaw = await exporter.toHeaderLine(stashSnapshot, exportedData);
    for (const item of searchResp.itemGroupSummaries) {
      const raw = await exporter.toRawLine(stashSnapshot, exportedData, item);
      allRaw += raw;
    }
    exportedData.exportRaw = allRaw;

    if (
      userId === stashSnapshot.userId &&
      input.oneClickPost &&
      input.ign?.length > 3
    ) {
      await this.handleOneClick(userId, input, exportedData);
    }

    return exportedData;
  }

  private async handleOneClick(
    userId: string,
    input: GqlStashSnapshotExportInput,
    exportedData: GqlStashSnapshotExport
  ) {
    const userProfile = await this.postgresService.prisma.userProfile.findFirst(
      {
        where: { userId },
      }
    );
    const discordId = userProfile?.discordUserId;
    if (discordId) {
      await this.tftService.postBulkListing(
        userId,
        discordId,
        input.league,
        input.exportType,
        input.exportSubType,
        exportedData.exportRaw,
        `https://poestack.com/api/bulk-export/test?input=${encodeURIComponent(
          JSON.stringify(input)
        )}`
      );
    }
  }

  public static getCommonPricings(exportedData: GqlStashSnapshotExport): {
    totalValueChaos: number;
    totalValueDiv: number;
    listedValueChaos: number;
    listedValueDiv: number;
  } {
    const totalValueChaos = +exportedData.totalValueChaos.toFixed(0);
    const totalValueDiv = +(
      exportedData.totalValueChaos / exportedData.divineChaosValue
    ).toFixed(1);
    const listedValueChaos = +(
      exportedData.totalValueChaos * exportedData.input.listedValueMultiplier
    ).toFixed(0);
    const listedValueDiv = +(
      (exportedData.totalValueChaos *
        exportedData.input.listedValueMultiplier) /
      exportedData.divineChaosValue
    ).toFixed(1);

    return { totalValueChaos, totalValueDiv, listedValueChaos, listedValueDiv };
  }

  public static chaosValueToPriceString(
    exportedData: GqlStashSnapshotExport,
    valueChaos: number,
    chaosDisplay = "c",
    divDisplay = "div"
  ): string {
    let value = +valueChaos.toFixed(0);
    let valueCurrencyType = chaosDisplay;
    if (
      !exportedData.input.alwaysPriceInChaos &&
      exportedData.divineChaosValue > 0 &&
      value > exportedData.divineChaosValue
    ) {
      value = +(value / exportedData.divineChaosValue).toFixed(1);
      valueCurrencyType = " " + divDisplay;
    }
    return `${value}${valueCurrencyType}`;
  }
}

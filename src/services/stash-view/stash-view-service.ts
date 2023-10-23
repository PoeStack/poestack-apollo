import { STASH_VIEW_TFT_CATEGORIES } from "./stash-view-tft-categories";

import { Logger } from "./../logger";
import PostgresService from "../mongo/postgres-service";
import { S3Service } from "./../s3-service";

import { singleton } from "tsyringe";
import { OneClickMessageHistory } from "@prisma/client";
import {
  GqlStashViewSettings,
  GqlStashViewStashSummary,
  GqlStashViewStashSummarySearch,
} from "../../models/basic-models";
import TftOneClickService from "../../services/tft/tft-one-click-service";
import { StashViewUtil } from "./stash-view-util";
import {
  StashViewSnapshotGrouped,
  StashViewSnapshotItemGroups,
  StashViewSnapshotUntracked,
  StashViewUntrackedItemEntry,
} from "./stash-view-models";

@singleton()
export default class StashViewService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly s3Service: S3Service,
    private readonly tftOneClickService: TftOneClickService
  ) {}

  public async oneClickPostMessage(
    opaqueKey: string,
    input: GqlStashViewSettings
  ): Promise<string> {
    if(input.ign?.include("@") {
      throw new Error("ign cannot include @");
    }
    
    input.selectedView = "TFT-Bulk";
    const tftCategory = STASH_VIEW_TFT_CATEGORIES[input.tftSelectedCategory];
    input.checkedTags = tftCategory!.tags;

    if (!tftCategory.enableOverrides && input.valueOverridesEnabled) {
      throw new Error("Overrides cannot be used in this channel.");
    }
    if (!tftCategory.enableOverrides) {
      input.valueOverridesEnabled = false;
    }

    const summary = await this.fetchMostRecentStashSummary(
      input.league,
      opaqueKey
    );

    const listingBody: string = tftCategory.export(summary, null, input);
    return listingBody;
  }

  public async oneClickPost(userId: string, input: GqlStashViewSettings) {
    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { userId: userId } }
    );
    const listingBody: string = await this.oneClickPostMessage(
      user.opaqueKey,
      input
    );

    const tftCategory = STASH_VIEW_TFT_CATEGORIES[input.tftSelectedCategory];
    const targetChannel = tftCategory.channels[input.league];
    const resp = await this.tftOneClickService.postOneClickMesage(
      targetChannel.channelId,
      targetChannel.timeout,
      {
        discordUserId: user.discordUserId,
        discordUsername: user.discordUsername,
        poeAccountProfileName: user.poeProfileName,
        poeAccountId: user.userId,
        league: input.league,
        messageBody: listingBody,
        imageUrl: !targetChannel.disableImages
          ? `https://octopus-app-tw5um.ondigitalocean.app/api/stash-view/tft-export-image?input=${encodeURIComponent(
              JSON.stringify(input)
            )}&opaqueKey=${user.opaqueKey}`
          : null,
        test: false,
      }
    );

    if (resp?.messageId) {
      Logger.info("sent tft-one-click", {
        userId: userId,
        tftSelectedCategory: input.tftSelectedCategory,
      });
    }

    const listingHistory: OneClickMessageHistory = {
      messageId: resp.messageId,
      userId: userId,
      channelId: targetChannel.channelId,
      exportType: input.tftSelectedCategory,
      exportSubType: null,
      rateLimitExpires: new Date(
        new Date().getTime() + targetChannel.timeout * 1000
      ),
      timestamp: new Date(),
    };
    await this.postgresService.prisma.oneClickMessageHistory.create({
      data: listingHistory,
    });

    return listingBody;
  }

  public async fetchMostRecentStashSummary(
    league: string,
    opaqueKey: string
  ): Promise<
    (GqlStashViewStashSummary & { updatedAtTimestamp?: string }) | null
  > {
    const currentSnapshot = await this.s3Service.getJson(
      "poe-stack-stash-view",
      `v1/stash/${opaqueKey}/${league}/snapshots/current_snapshot.json`
    );
    if (currentSnapshot) {
      return await this.fetchStashSummary(
        league,
        opaqueKey,
        currentSnapshot.timestamp
      );
    }

    return null;
  }

  public async fetchStashSummary(
    league: string,
    opaqueKey: string,
    timestampISO: string
  ): Promise<GqlStashViewStashSummary & { updatedAtTimestamp?: string }> {
    const trackedJson: StashViewSnapshotGrouped = await this.s3Service.getJson(
      "poe-stack-stash-view",
      `v1/stash/${opaqueKey}/${league}/snapshots/${timestampISO}/tracked.json`
    );
    const untrackedJson: StashViewSnapshotUntracked =
      await this.s3Service.getJson(
        "poe-stack-stash-view",
        `v1/stash/${opaqueKey}/${league}/snapshots/${timestampISO}/untracked.json`
      );
    const itemGroupsJson: StashViewSnapshotItemGroups =
      await this.s3Service.getJson(
        "poe-stack-stash-view",
        `v1/stash/${opaqueKey}/${league}/snapshots/${timestampISO}/item_groups.json`
      );

    if (!trackedJson || !untrackedJson || !itemGroupsJson) {
      return {
        itemGroups: [],
        items: [],
      };
    } else {
      const items: any[] = [];

      for (const [stashId, entries] of [
        ...Object.entries(trackedJson.entriesByTab),
        ...Object.entries(untrackedJson.entriesByTab),
      ]) {
        for (const item of entries) {
          const itemGroup =
            "itemGroupHashString" in item
              ? itemGroupsJson.itemGroups.find(
                  (ig) => ig.hashString === item.itemGroupHashString
                )
              : null;
          items.push({
            ...item,
            stashId: stashId,
            league: league as string,
            itemGroup: itemGroup,
          });
        }
      }

      return {
        itemGroups: itemGroupsJson.itemGroups,
        updatedAtTimestamp: `${trackedJson.timestamp}`,
        items: items,
      };
    }
  }
}

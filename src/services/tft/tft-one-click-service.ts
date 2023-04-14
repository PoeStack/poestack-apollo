import fs from "fs";
import { Logger } from "./../logger";
import assert from "assert";
import TftDiscordBotService from "./tft-discord-bot-service";
import { singleton } from "tsyringe";
import TftBlacklistService from "./utils/tft-blacklist-service";
import TftRateLimitService from "./utils/tft-rate-limit-service";
import PostgresService from "../../services/mongo/postgres-service";
import { OneClickMessageHistory } from "@prisma/client";

@singleton()
export default class TftOneClickService {
  private config: TftDiscordServerConfig;

  constructor(
    private discordService: TftDiscordBotService,
    private rateLimitService: TftRateLimitService,
    private blacklistService: TftBlacklistService,
    private postgresService: PostgresService
  ) {
    this.config = JSON.parse(
      fs.readFileSync("data/tft/discord-bulk-listing-config.json").toString()
    );
  }

  public async checkUserIsMember(discordId: string): Promise<boolean> {
    return await this.discordService.checkUserIsMember(
      discordId,
      this.config.severId
    );
  }

  public async createBulkListing(bulkListing: TftBulkListing): Promise<{
    sucess: boolean;
    rateLimitedForSeconds: number;
  }> {
    assert(!!bulkListing);
    assert(!!bulkListing.discordUserId);
    assert(!!bulkListing.poeAccountId);
    assert(!!bulkListing.listingType);
    assert(!!bulkListing.league);
    assert(!!bulkListing.messageBody);

    const rateLimitKey = `create-bulk-listing_${bulkListing.listingType}_${bulkListing.listingSubType}`;
    const retryAfterSeconds = await this.rateLimitService.fetchLimit(
      rateLimitKey,
      bulkListing.discordUserId
    );
    if (retryAfterSeconds > 0) {
      return { sucess: false, rateLimitedForSeconds: retryAfterSeconds };
    }
    await this.rateLimitService.updateLimit(
      rateLimitKey,
      bulkListing.discordUserId,
      5
    );

    const targetChannel = this.config.bulkListingChannels.find(
      (e) =>
        e.listingType === bulkListing.listingType &&
        e.league === bulkListing.league &&
        (!e.listingSubType || e.listingSubType === bulkListing.listingSubType)
    );
    Logger.info(
      `found target channel ${
        targetChannel ? JSON.stringify(targetChannel) : null
      } for ${JSON.stringify(bulkListing)}`
    );

    if (!targetChannel) {
      throw new Error(
        `Failed to find Discord channel for ${bulkListing.league} ${bulkListing.listingType} ${bulkListing.listingSubType}`
      );
    }

    const userBlacklisted = this.blacklistService.userIsBlacklisted(
      bulkListing.poeAccountProfileName
    );
    if (userBlacklisted) {
      throw new Error(
        `User ${bulkListing.poeAccountProfileName} is blacklisted by TFT`
      );
    }

    const userIsMember = await this.discordService.checkUserIsMember(
      bulkListing.discordUserId,
      this.config.severId
    );
    if (!userIsMember) {
      throw new Error(
        `User ${bulkListing.discordUserId} is not a member of the server`
      );
    }

    const mappedMessageBody = bulkListing.messageBody
      .replaceAll(":divine:", "<:divine:666765844541603861>")
      .replaceAll(":chaos:", "<:chaos:951514139610738728>");

    const messageResp = await this.discordService.sendMessage(
      targetChannel.channelId,
      `${mappedMessageBody}\nby <@${bulkListing.discordUserId}>`,
      targetChannel.disableImages ? null : bulkListing.imageUrl
    );

    const listingHistory: OneClickMessageHistory = {
      messageId: messageResp.id,
      userId: bulkListing.poeAccountId,
      channelId: targetChannel.channelId,
      exportType: bulkListing.listingType,
      exportSubType: bulkListing.listingSubType,
      rateLimitExpires: new Date(
        new Date().getTime() + targetChannel.rateLimitSeconds * 1000
      ),
      timestamp: new Date(),
    };
    await this.postgresService.prisma.oneClickMessageHistory.create({
      data: listingHistory,
    });

    await this.rateLimitService.updateLimit(
      rateLimitKey,
      bulkListing.discordUserId,
      targetChannel.rateLimitSeconds
    );

    return {
      sucess: !!messageResp,
      rateLimitedForSeconds: targetChannel.rateLimitSeconds,
    };
  }
}

export class TftBulkListing {
  discordUserId: string;

  poeAccountProfileName: string;
  poeAccountId: string;

  league: string;
  listingType: string;
  listingSubType?: string;
  messageBody: string;

  imageUrl: string;

  test: boolean;
}

export class TftDiscordServerConfig {
  severId: string;
  bulkListingChannels: TftDiscordBulkListingChannel[];
}

export class TftDiscordBulkListingChannel {
  channelId: string;
  listingType: string;
  league: string;
  listingSubType?: string;
  rateLimitSeconds: number;
  disableImages: boolean;
}
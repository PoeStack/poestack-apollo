import fs from "fs";
import { Logger } from "./../logger";
import assert from "assert";
import TftDiscordBotService from "./tft-discord-bot-service";
import { singleton } from "tsyringe";
import TftBlacklistService from "./utils/tft-blacklist-service";
import TftRateLimitService from "./utils/tft-rate-limit-service";
import PostgresService from "../../services/mongo/postgres-service";
import { OneClickMessageHistory } from "@prisma/client";
import DiscordService from "../../services/discord-service";
import { GuildMember } from "discord.js";

@singleton()
export default class TftOneClickService {
  private config: TftDiscordServerConfig;

  constructor(
    private discordBotService: TftDiscordBotService,
    private rateLimitService: TftRateLimitService,
    private blacklistService: TftBlacklistService,
    private postgresService: PostgresService,
    private discordService: DiscordService
  ) {
    this.config = JSON.parse(
      fs.readFileSync("data/tft/discord-bulk-listing-config.json").toString()
    );
  }




  public async checkUserIsMember(discordId: string): Promise<GuildMember> {
    const user = await this.discordBotService.fetchGuildMember(
      discordId,
      this.config.severId,
      true
    );
    return user;
  }

  public async postOneClickMesage(
    targetChannelId: string,
    cooldown: number,
    bulkListing: TftOneClickConfig
  ): Promise<{
    sucess: boolean;
    rateLimitedForSeconds: number;
    messageId: string | null;
  }> {
    assert(!!bulkListing);
    assert(!!bulkListing.discordUserId);
    assert(!!bulkListing.poeAccountId);
    assert(!!bulkListing.league);
    assert(!!bulkListing.messageBody);

    const rateLimitKey = `create-bulk-listing_${targetChannelId}`;
    const retryAfterMs = await this.rateLimitService.fetchLimitMs(
      rateLimitKey,
      bulkListing.discordUserId
    );
    if (retryAfterMs > 0) {
      throw new Error(
        `Cooldown active try again in ${Math.round(
          retryAfterMs / 1000
        )} seconds.`
      );
    }
    await this.rateLimitService.updateLimit(
      rateLimitKey,
      bulkListing.discordUserId,
      5
    );

    const userBlacklisted = this.blacklistService.userIsBlacklisted(
      bulkListing.poeAccountProfileName
    );
    if (userBlacklisted) {
      throw new Error(
        `User ${bulkListing.poeAccountProfileName} is blacklisted by TFT`
      );
    }

    const memberUser = await this.discordBotService.fetchGuildMember(
      bulkListing.discordUserId,
      this.config.severId,
      true
    );
    if (!memberUser) {
      throw new Error(
        `User ${bulkListing.discordUsername} ${bulkListing.discordUserId} is not a member of the server`
      );
    }

    const userHasBadRoles = memberUser.roles.cache.some((e) =>
      ["Trade Restricted", "Muted"].includes(e.name)
    );
    if (userHasBadRoles) {
      throw new Error(
        `User ${bulkListing.discordUsername} ${bulkListing.discordUserId} is trade restricted`
      );
    }

    if (
      ["874662778592460851", "882251982830731315"].includes(targetChannelId) &&
      !memberUser.roles.cache.some((e) => e.id === "848751148478758914")
    ) {
      throw new Error(
        `User ${bulkListing.discordUsername} ${bulkListing.discordUserId} must have their poe account linked to TFT to access this channel. Read more (https://discord.com/channels/645607528297922560/665132391983218694/1096931567236022352)`
      );
    }

    const mappedMessageBody = bulkListing.messageBody
      .replaceAll(":divine:", "<:divine:666765844541603861>")
      .replaceAll(":chaos:", "<:chaos:951514139610738728>");

    const channelId = bulkListing.test
      ? "1075492470294585535"
      : targetChannelId;

    let messageResp;
    const body = `${mappedMessageBody}\nby <@${bulkListing.discordUserId}> using https://poestack.com/tft/bulk-tool`;
    try {
      messageResp = await this.discordBotService.sendMessage(
        channelId,
        body,
        bulkListing.imageUrl
      );
    } catch (error) {
      await this.discordService.ping(
        `Discord message error, ${body?.length}, ${error}, ${body.slice(
          0,
          200
        )}`
      );
      throw error;
    }

    if (!bulkListing.test) {
      await this.rateLimitService.updateLimit(
        rateLimitKey,
        bulkListing.discordUserId,
        cooldown
      );
    }

    return {
      messageId: messageResp?.id,
      sucess: !!messageResp,
      rateLimitedForSeconds: cooldown,
    };
  }
}

export class TftOneClickConfig {
  discordUserId: string;
  discordUsername?: string;

  poeAccountProfileName: string;
  poeAccountId: string;

  league: string;
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

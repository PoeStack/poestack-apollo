import { TftParsers } from "./tft-parsers";
import {
  Events,
  GuildMemberRoleManager,
  Message,
  Role,
  TextChannel,
} from "discord.js";
import TftDiscordBotService from "../tft-discord-bot-service";
import { singleton } from "tsyringe";
import { Logger } from "../../logger";
import PostgresService from "../../mongo/postgres-service";
import { PartialMessage } from "discord.js";
import { TftLiveListing } from "@prisma/client";

@singleton()
export class TftChannelParserService {
  DISPLAY_ROLES = [
    "Immortal Service Providers",
    "Legendary Service Providers",
    "Alpha Service Providers",
    "Eternal Service Providers",
    "Sacred Service Providers",
    "Ascended Service Providers",
    "Exalted Service Providers",
    "Awakened TFT Friends",
    "Awakened Service Providers",
    "Trusted Service Providers",
  ];

  CHANNEL_PARSERS: Record<string, { tag: string; parse: (e: string) => any }> =
    {
      "1049819931564310678": {
        tag: "five-way",
        parse: TftParsers.parseFiveWay,
      },
      "939791301371654185": {
        tag: "compasses",
        parse: TftParsers.parseCompasses,
      },
    };

  constructor(
    private readonly tftDiscordBotService: TftDiscordBotService,
    private readonly postgresService: PostgresService
  ) {}

  public async delist(messageId: string) {
    await this.postgresService.prisma.tftLiveListing.updateMany({
      where: {
        messageId: messageId,
      },
      data: {
        delistedAtTimestamp: new Date(),
      },
    });
  }

  public async updateMessage(
    messageId: string,
    message: (Message | PartialMessage) | null,
    parser: { tag: string; parse: (e: string) => any }
  ) {
    if (!message) {
      await this.delist(messageId);
      return;
    }

    try {
      const parsedFiveway = parser.parse(message.content);

      let displayRole: Role | null = null;
      message.member?.roles?.cache?.forEach((role) => {
        if (this.DISPLAY_ROLES.includes(role.name)) {
          displayRole = role;
        }
      });

      let author = message.author;
      if (author?.id === "1081272164474441728") {
        author = message.mentions.users.at(0);
      }

      const listing: TftLiveListing = {
        userDiscordName: author?.username,
        channelId: message.channelId,
        messageId: messageId,
        userDiscordDisplayRole: displayRole?.name,
        userDiscordDisplayRoleColor: displayRole?.hexColor,
        userDiscordHighestRole: message.member?.roles?.highest?.name,
        tag: parser.tag,
        delistedAtTimestamp: null,
        body: message.content,
        userDiscordId: author?.id,
        properties: parsedFiveway,
        updatedAtTimestamp: new Date(),
      };

      await this.postgresService.prisma.tftLiveListing.upsert({
        where: {
          userDiscordId_channelId: {
            channelId: message.channelId,
            userDiscordId: author.id,
          },
        },
        create: listing,
        update: {
          properties: listing.properties,
          updatedAtTimestamp: listing.updatedAtTimestamp,
          delistedAtTimestamp: null,
          messageId: messageId,
        },
      });
    } catch (error) {
      await this.delist(messageId);
    }
  }

  public async recheckOldMessages() {
    const activeListings =
      await this.postgresService.prisma.tftLiveListing.findMany({
        where: {
          delistedAtTimestamp: null,
          updatedAtTimestamp: { gte: new Date(Date.now() - 1000 * 60 * 15) },
        },
      });

    for (const listing of activeListings) {
      const channel = await this.tftDiscordBotService.client.channels.fetch(
        listing.channelId
      );

      try {
        const message = await (channel as TextChannel).messages.fetch(
          listing.messageId
        );

        const parser = this.CHANNEL_PARSERS[message.channelId];
        if (!parser) {
          throw new Error("Failed to find parser.");
        }

        await this.updateMessage(listing.messageId, message, parser);
      } catch (error) {
        console.log("err msg");
        await this.updateMessage(listing.messageId, null, null);
      }
    }
  }

  public async start() {
    this.tftDiscordBotService.client.once(Events.ClientReady, async (c) => {
      Logger.info(`Ready! Logged in as ${c.user.tag}`);
      await this.recheckOldMessages();
    });

    this.tftDiscordBotService.client.on(
      Events.MessageDelete,
      async (message) => {
        try {
          const parser = this.CHANNEL_PARSERS[message.channelId];
          if (parser) {
            await this.postgresService.prisma.tftLiveListing.updateMany({
              where: { messageId: message.id },
              data: {
                delistedAtTimestamp: new Date(),
              },
            });
          }
        } catch (error) {
          Logger.info("error deleting five-way message", error);
        }
      }
    );

    this.tftDiscordBotService.client.on(
      Events.MessageUpdate,
      async (oldMessage, newMessage) => {
        try {
          const parser = this.CHANNEL_PARSERS[newMessage.channelId];
          if (parser) {
            await this.updateMessage(newMessage.id, newMessage, parser);
          }
        } catch (error) {
          Logger.info("error deleting five-way message", error);
        }
      }
    );

    this.tftDiscordBotService.client.on(
      Events.MessageCreate,
      async (message) => {
        try {
          const parser = this.CHANNEL_PARSERS[message.channelId];
          if (parser) {
            await this.updateMessage(message.id, message, parser);
          }
        } catch (error) {
          Logger.info("error parsing five-way message", error);
        }
      }
    );
  }
}

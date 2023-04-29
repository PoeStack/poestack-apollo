import { Events, Message, TextChannel } from "discord.js";
import TftDiscordBotService from "../tft-discord-bot-service";
import { singleton } from "tsyringe";
import { Logger } from "../../../services/logger";
import PostgresService from "../../../services/mongo/postgres-service";

@singleton()
export class TftFiveWayParser {
  constructor(
    private readonly tftDiscordBotService: TftDiscordBotService,
    private readonly postgresService: PostgresService
  ) {}

  public parseFiveWay(content: string): {
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

    const priceDiv = this.extractNumber(lines[2], null, [
      "div",
      "divine",
      "<:divine:666765844541603861>",
    ]);
    const runs = this.extractNumber(lines[2], null, ["run"]);
    const clients = this.extractNumber(lines[4], ["client"], null).split("/");
    const resetters = this.extractNumber(lines[4], ["resetter"], null).split(
      "/"
    );
    const aurabots = this.extractNumber(lines[4], ["aurabot"], null).split("/");
    const kills = this.extractNumber(
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
      priceDiv: parseInt(priceDiv),
      runs: parseInt(runs),
      currentClients: parseInt(clients[0]),
      maxClients: parseInt(clients[1]),
      currentResetters: parseInt(resetters[0]),
      maxResetters: parseInt(resetters[1]),
      currentAurabots: parseInt(aurabots[0]),
      maxAurabots: parseInt(aurabots[1]),
      kills: kills ? parseInt(kills) : undefined,
      regions: regions,
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

  public async updateMessage(
    authorId: string,
    channelId: string,
    messageId: string,
    content: string | null
  ) {
    if (!content) {
      await this.postgresService.prisma.tftLiveListing.updateMany({
        where: {
          messageId: messageId,
        },
        data: {
          delistedAtTimestamp: new Date(),
        },
      });
    }

    try {
      const parsedFiveway = this.parseFiveWay(content);
      await this.postgresService.prisma.tftLiveListing.upsert({
        where: {
          messageId: messageId,
        },
        create: {
          channelId: channelId,
          messageId: messageId,
          listedAtTimestamp: new Date(),
          tag: "five-way",
          properties: parsedFiveway,
          delistedAtTimestamp: null,
          body: content,
          updatedAtTimestamp: new Date(),
          userDiscordId: authorId,
        },
        update: {
          body: content,
          updatedAtTimestamp: new Date(),
          userDiscordId: authorId,
          properties: parsedFiveway,
        },
      });
    } catch (error) {
      await this.postgresService.prisma.tftLiveListing.updateMany({
        where: {
          messageId: messageId,
        },
        data: {
          delistedAtTimestamp: new Date(),
        },
      });
    }
  }

  public async start() {
    const activeListings =
      await this.postgresService.prisma.tftLiveListing.findMany({
        where: { delistedAtTimestamp: null },
      });

    for (const listing of activeListings) {
      const channel = await this.tftDiscordBotService.client.channels.fetch(
        listing.channelId
      );

      try {
        const message = await (channel as TextChannel).messages.fetch(
          listing.messageId
        );
        await this.updateMessage(
          message.author.id,
          listing.channelId,
          listing.messageId,
          message.content
        );
      } catch (error) {
        console.log("err msg");
        await this.updateMessage(
          null,
          listing.channelId,
          listing.messageId,
          null
        );
      }
    }

    this.tftDiscordBotService.client.on(
      Events.MessageDelete,
      async (message) => {
        try {
          if (message.channelId === "1049819931564310678") {
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
          if (newMessage.channelId === "1049819931564310678") {
            if (newMessage.author.bot) {
              return;
            }

            console.log("Edited", newMessage.content);
            await this.updateMessage(
              newMessage.author.id,
              newMessage.channelId,
              newMessage.id,
              newMessage.content
            );
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
          if (message.channelId === "1049819931564310678") {
            if (message.author.bot) {
              return;
            }

            await this.updateMessage(
              message.author.id,
              message.channelId,
              message.id,
              message.content
            );
          }
        } catch (error) {
          Logger.info("error parsing five-way message", error);
        }
      }
    );
  }

  private extractNumber(
    line: string,
    prefixes: string[] | null,
    suffixes: string[] | null
  ): string | null {
    if (prefixes) {
      for (const prefix of prefixes) {
        const match = line.match(
          new RegExp(String.raw`${prefix}[s*,\s]+\s*([+-]?([0-9]*[.\/])?[0-9])`)
        );
        const selection = match?.[1];
        if (selection) {
          return selection;
        }
      }
    } else if (suffixes) {
      for (const suffix of suffixes) {
        const match = line.match(
          new RegExp(
            String.raw`([+-]?([0-9]*[.\/])?[0-9]+)\s*${suffix}[s*,\s]*`
          )
        );
        const selection = match?.[1];
        if (selection) {
          return selection;
        }
      }
    }

    return null;
  }
}

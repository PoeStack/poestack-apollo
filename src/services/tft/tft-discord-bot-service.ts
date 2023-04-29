import { singleton } from "tsyringe";
import PostgresService from "../mongo/postgres-service";
import { Logger } from "../logger";
import {
  AttachmentBuilder,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import fetch from "node-fetch";

@singleton()
export default class TftDiscordBotService {
  public client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  public async start() {
    this.client.once(Events.ClientReady, (c) => {
      Logger.info(`Ready! Logged in as ${c.user.tag}`);
    });
    await this.client.login(process.env.DISCORD_POESTACK_BOT_TOKEN);
  }

  public async checkUserForBadRoles(
    discordUserId: string,
    serverId: string
  ): Promise<boolean> {
    try {
      const guild = await this.client.guilds.fetch(serverId);
      if (!guild) {
        throw new Error(`Failed to fetch guild ${serverId}`);
      }
      const memberUser = await guild.members.fetch(discordUserId);
      const bad = memberUser.roles.cache.some((e) =>
        ["Trade Restricted", "Muted"].includes(e.name)
      );
      return bad;
    } catch (error) {
      return false;
    }
  }

  public async fetchGuildMember(
    discordUserId: string,
    serverId: string,
    force: boolean = false
  ): Promise<GuildMember | null> {
    try {
      const guild = await this.client.guilds.fetch(serverId);
      if (!guild) {
        throw new Error(`Failed to fetch guild ${serverId}`);
      }
      const memberUser = await guild.members.fetch({
        user: discordUserId,
        force: force,
      });
      return memberUser;
    } catch (error) {}
    return null;
  }

  public async deleteMessage(channelId: string, messageId: string) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      await (channel as TextChannel).messages.delete(messageId);
    } catch (error) {
      Logger.error("error deleting message", error);
    }
  }

  public async sendMessage(
    channelId: string,
    messageBody: string,
    imageUrl: string
  ): Promise<Message | null | undefined> {
    const channel = await this.client.channels.fetch(channelId);
    const message = {
      content: messageBody,
    };

    if (imageUrl) {
      const response = await fetch(imageUrl);
      if (response.status === 200) {
        const buffer = await response.arrayBuffer();
        message["files"] = [
          { attachment: Buffer.from(buffer), name: "listing.png" },
        ];
      } else {
        throw new Error(
          `Failed to load image from url ${response.status} ${response.statusText}, ${imageUrl}`
        );
      }
    }

    const resp = await (channel as TextChannel).send(message);
    return resp;
  }
}

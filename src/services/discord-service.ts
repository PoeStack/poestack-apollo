import fetch from "node-fetch";
import { singleton } from "tsyringe";
import PostgresService from "./mongo/postgres-service";
import { Logger } from "./logger";

@singleton()
export default class DiscordService {
  constructor(private readonly postgresService: PostgresService) {}

  public async exchangeTokenForUserId(code: string): Promise<string> {
    const codeExchangeResp = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: "1075074940275019836",
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: "https://poestack.com/discord/connected",
        }),
      }
    );
    const authCodeJson = await codeExchangeResp.json();

    const userMeResp = await fetch("https://discord.com/api/users/@me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authCodeJson.access_token}`,
      },
    });
    const userMeJson = await userMeResp.json();
    return userMeJson?.id;
  }

  public async start() {
    if (process.env.DEV !== "true") {
      this.ping("server started - " + process.env.SERVICE_NAME);
    }

    if (process.env.START_DISCORD_STREAM === "true") {
      for (;;) {
        try {
          const users = await this.postgresService.prisma.userProfile.findMany({
            select: { lastConnectedTimestamp: true },
          });

          const activeUsers30Mins = users.filter(
            (u) =>
              u.lastConnectedTimestamp.valueOf() >= Date.now() - 1000 * 60 * 30
          );
          const activeUsers2Hours = users.filter(
            (u) =>
              u.lastConnectedTimestamp.valueOf() >=
              Date.now() - 1000 * 60 * 60 * 2
          );
          const activeUsers24Hours = users.filter(
            (u) =>
              u.lastConnectedTimestamp.valueOf() >=
              Date.now() - 1000 * 60 * 60 * 24
          );

          await this.ping(
            `active users - ${activeUsers30Mins.length} : ${activeUsers2Hours.length} : ${activeUsers24Hours.length} : total ${users.length}`
          );
          await new Promise((res) => setTimeout(res, 1000 * 60 * 5));
        } catch (error) {
          Logger.error("error during discord loop", error);
        }
      }
    }
  }

  public async sendMemoryUsage(source: string) {
    const used = process.memoryUsage();
    const usages = Object.keys(used)
      .map(
        (key) =>
          `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
      )
      .join(" ");

    await this.ping(`Memory ${source} - ${usages}`);
  }

  public async ping(msg: string) {
    try {
      await fetch(
        "https://discord.com/api/webhooks/1065504177834438706/gjnkNZpyAeLvJ4F5zh9WKkzQ8xAmX_7fb3osPc3JGURdwN2mTmZSuM7DM7xxk1vGS0ID",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: msg,
          }),
        }
      );
    } catch (error) {
      Logger.error("error during discord ping", error);
    }
  }
}

/* import { Client, Events, GatewayIntentBits } from "discord.js"; */
import { singleton } from "tsyringe";
import PostgresService from "../mongo/postgres-service";
import { Logger } from "../logger";

@singleton()
export default class TftDiscordBotService {
/*   constructor(private readonly postgresService: PostgresService) {}

  private client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
 */
  public async start() {
/*     this.client.once(Events.ClientReady, (c) => {
      Logger.info(`Ready! Logged in as ${c.user.tag}`);
    });
    await this.client.login(process.env.DISCORD_BOT_TOKEN); */
  }
}

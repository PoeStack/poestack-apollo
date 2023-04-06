export class TftFiveWayParser {
  /* private parseDivs(line: string): number[] {
    line = line.replaceAll("divs ", "div ");
    line = line.replaceAll("divine ", "div ");
    line = line.replaceAll("divines ", "div ");
    line = line.replaceAll("<:divine:666765844541603861>", "div");
    const matches = [...line.matchAll(/([\d.]+) *div/g)];
    const divs = matches.map((e) => +e[1]);
    return divs;
  }

  private fiveWayParse(m: Message): Record<string, any> | null {
    const properties: any = {};

    const lines = m.content.split("\n").map((e) => e.toLowerCase().trim());
    for (const line of lines) {
      if (line.startsWith("region")) {
        if (line.includes("eu")) {
          properties["region"] = "eu";
        } else if (line.includes("na")) {
          properties["region"] = "na";
        }
      }

      if (line.startsWith("price")) {
        properties["priceDivs"] = this.parseDivs(line)?.[0];
        properties["runs"] = +line.match(/([\d.]+) *run/)?.[1];
      }

      if (line.includes("@")) {
        const ign = line.match(/@([\S.]+)/)?.[1];
        properties.ign = ign;
      }
    }

    if (
      !properties.region ||
      !properties.priceDivs ||
      !properties.runs ||
      !properties.ign
    ) {
      return null;
    }

    return properties;
  }

  public async start() {
    this.client.once(Events.ClientReady, (c) => {
      Logger.info(`Ready! Logged in as ${c.user.tag}`);
    });
    await this.client.login(process.env.DISCORD_BOT_TOKEN);

    const channel = (await this.client.channels.fetch(
      "1049819931564310678"
    )) as TextChannel;
    for (;;) {
      try {
        const msgs = await channel.awaitMessages({
          time: 10000,
        });
        if (msgs.size > 0) {
          for (const [key, msg] of msgs) {
            const properties = this.fiveWayParse(msg);

            if (properties) {
              const discordServiceListing: DiscordServiceMessageRecord = {
                messageId: msg.id,
                guildId: msg.guildId,
                channelId: msg.channelId,
                senderDiscordId: msg.author.id,
                timestamp: new Date(),
                type: "five-way",
                properties: properties,
              };

              await this.postgresService.prisma.discordServiceMessageRecord.create(
                { data: discordServiceListing }
              );
            }
          }
        }
      } catch (error) {
        console.error("err", error);
      }
    }
  } */
}

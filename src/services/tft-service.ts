import { singleton } from "tsyringe";
import fetch from "node-fetch";

@singleton()
export default class TftService {
  public async checkTftMembership(discordId: string): Promise<boolean> {
    const resp = await fetch(
      `https://discord-bot.poestack.com/tft/member-check?discordId=${discordId}`,
      {
        method: "GET",
        headers: {
          Authorization: process.env.TFT_ONE_CLICK_AUTH_CODE ?? "Missing Token",
        },
      }
    );
    const body = await resp.text();
    return body === "true";
  }

  public async postBulkListing(
    poeUserId: string,
    discordId: string,
    league: string,
    exportType: string,
    exportSubType: string,
    exportRaw: string,
    imageUrl: string
  ) {
    await fetch("https://discord-bot.poestack.com/tft/bulk-listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.TFT_ONE_CLICK_AUTH_CODE ?? "Missing Token",
      },
      body: JSON.stringify({
        discordUserId: discordId,
        poeAccountId: poeUserId,
        league: league,
        listingType: exportType,
        listingSubType: exportSubType,
        messageBody: exportRaw,
        imageUrl,
      }),
    });
  }
}

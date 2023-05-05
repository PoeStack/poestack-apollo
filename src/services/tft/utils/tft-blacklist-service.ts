import { Logger } from './../../logger';
import { singleton } from "tsyringe";
import fetch from "node-fetch";

@singleton()
export default class TftBlacklistService {
  private blockedUserProfileNames: Set<string>;

  public userIsBlacklisted(userProfileName: string): boolean {
    return this.blockedUserProfileNames?.has(userProfileName?.toLowerCase());
  }

  public async pullBlacklist() {
    const rawResp = await fetch(
      "https://raw.githubusercontent.com/The-Forbidden-Trove/ForbiddenTroveBlacklist/main/blacklist.csv"
    );

    if (rawResp.status !== 200) {
      throw new Error(
        "Failed to load blacklist : " +
          rawResp.status +
          " : " +
          rawResp.statusText
      );
    }

    const body = await rawResp.text();
    if (body.length < 400) {
      throw new Error("Failed to load blacklist short body");
    }

    const lines = body.split("\n");
    lines.shift();
    const blacklistedUserProfileNames = [];
    for (const line of lines) {
      const cols = line.split(",");
      blacklistedUserProfileNames.push(cols[0]?.toLowerCase()?.slice(1, -1));
    }
    Logger.info(
      `loaded ${blacklistedUserProfileNames.length} blacklisted users`
    );
    this.blockedUserProfileNames = new Set(blacklistedUserProfileNames);
  }

  public async startBlacklistUpdateTask() {
    while (true) {
      await new Promise((res) => setTimeout(res, 1000 * 60 * 10));
      try {
        await this.pullBlacklist();
      } catch (error) {
        Logger.info("error loading blacklist", error);
      }
    }
  }
}

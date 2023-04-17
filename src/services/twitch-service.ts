import fetch from "node-fetch";
import { singleton } from "tsyringe";
import PoeApi from "./poe/poe-api";
import PostgresService from "./mongo/postgres-service";
import { type TwitchStreamerProfile } from "@prisma/client";
import { Logger } from "./logger";

@singleton()
export class TwitchService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService
  ) {}

  public async startStreamerJob() {
    for (;;) {
      try {
        const updateDate = new Date();
        const res = await this.postgresService.prisma.userProfile.findMany({
          where: { NOT: { oAuthToken: null } },
        });
        for (const u of res) {
          try {
            const profile = await this.poeApi.fetchProfile(u.oAuthToken);
            const twitchName = profile?.data?.twitch?.name;
            if (twitchName) {
              const twitchProfile = await this.findViewCount(twitchName);

              if (twitchProfile?.view_count > 500) {
                const lastVideoDate = await this.findLastVideo(
                  twitchProfile.id
                );
                if (
                  lastVideoDate &&
                  (Date.now() - lastVideoDate.valueOf()) / 1000 <
                    60 * 60 * 24 * 30
                ) {
                  const profileUpsert: TwitchStreamerProfile = {
                    userId: u.userId,
                    profileName: twitchName,
                    viewCount: twitchProfile.view_count,
                    lastVideoTimestamp: lastVideoDate,
                    updatedAtTimestamp: updateDate,
                  };

                  await this.postgresService.prisma.twitchStreamerProfile.upsert(
                    {
                      where: { userId: u.userId },
                      create: profileUpsert,
                      update: profileUpsert,
                    }
                  );
                }
              }
            }
          } catch (error) {
            Logger.error("error in twtich job", error);
          }
        }
      } catch (error) {
        Logger.error("error in twtich job", error);
      }

      await new Promise((res) => setTimeout(res, 1000 * 60));
    }
  }

  public async findLastVideo(twitchUserId: string): Promise<Date> {
    const response = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${twitchUserId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOEKN}`,
          "Client-Id": process.env.TWITCH_ID,
        },
      }
    );

    const respCode = response.status;
    if (respCode !== 200) {
      console.log("error pulling twitch last video");
    }

    const body = await response.json();
    const lastVideoDate = body.data?.[0]?.created_at;
    if (lastVideoDate) {
      return new Date(lastVideoDate);
    }
    return null;
  }

  public async findViewCount(
    twitchName: string
  ): Promise<{ view_count: number; id: string }> {
    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${twitchName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOEKN}`,
          "Client-Id": process.env.TWITCH_ID,
        },
      }
    );

    const respCode = response.status;
    if (respCode !== 200) {
      console.log("error pulling twitch view count");
    }

    const body = await response.json();
    return body.data?.[0];
  }
}

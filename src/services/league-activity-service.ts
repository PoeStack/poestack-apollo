import { singleton } from "tsyringe";
import PostgresService from "./mongo/postgres-service";
import { Logger } from "./logger";
import { Prisma } from "@prisma/client";

@singleton()
export class LeagueActivityService {
  constructor(private readonly postgresService: PostgresService) {}

  public async startSnapshotJob() {
    for (;;) {
      try {
        const updatedAtEpochMs = Date.now();
        const hourlyEpochMs = updatedAtEpochMs - (updatedAtEpochMs % 3600000);
        const timestamp = new Date(hourlyEpochMs);

        const lookbackWindows = [1, 6, 12, 24, 48];
        for (const window of lookbackWindows) {
          const interval = Prisma.raw(`'${window} hour'`);
          const activity: { league: string; count: number }[] = await this
            .postgresService.prisma.$queryRaw`
          select league, count(*) from (
          select "league" from "PoePublicStashUpdateRecord"
          where "updatedAtTimestamp" > now() at time zone 'utc' - INTERVAL ${interval}
          group by "poeProfileName", "league" 
          ) x group by league`;

          for (const e of activity) {
            const update = {
              league: e.league,
              timestamp: timestamp,
              lookbackWindowHours: window,
              players: Number(e.count),
            };
            await this.postgresService.prisma.poeLeagueActivitySnapshot.upsert({
              where: {
                league_timestamp_lookbackWindowHours: {
                  league: e.league,
                  timestamp: timestamp,
                  lookbackWindowHours: window,
                },
              },
              create: update,
              update: update,
            });
          }
        }
      } catch (error) {
        Logger.error("error in activity snapshot", error);
      }
      await new Promise((res) => setTimeout(res, 1000 * 60 * 6));
    }
  }
}

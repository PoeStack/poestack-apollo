import PostgresService from "../../services/mongo/postgres-service";
import { singleton } from "tsyringe";

@singleton()
export class PoeLeagueStartService {
  private cache = {};
  constructor(private readonly postgresService: PostgresService) {}

  public async update(league: string) {
    if (!this.cache[league]) {
      this.cache[league] = new Date();
      await this.postgresService.prisma.poeLeagueStartRecord.createMany({
        data: [{ league: league, timestamp: new Date() }],
        skipDuplicates: true,
      });
    }
  }
}

import { singleton } from "tsyringe";
import PostgresService from "./mongo/postgres-service";
import { Logger } from "./logger";

@singleton()
export default class UserActivityService {
  constructor(private readonly postgresService: PostgresService) { }

  public async onRequest(userId: string) {
    try {
      if (userId) {
        const date = new Date();
        await this.postgresService.prisma.userProfile.updateMany({
          where: { userId },
          data: { lastConnectedTimestamp: date },
        });
      }
    } catch (error) {
      Logger.error("error in user activity onRequest", error);
    }
  }
}

import { singleton } from "tsyringe";
import PostgresService from "./mongo/postgres-service";

@singleton()
export class UserService {
  constructor(private readonly postgreService: PostgresService) {}

  public async fetchUserOAuthTokenSafe(userId: string): Promise<string> {
    const profile =
      await this.postgreService.prisma.userProfile.findFirstOrThrow({
        where: { userId },
      });
    return profile.oAuthToken;
  }
}

import jwt from "jsonwebtoken";
import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver, Mutation } from "type-graphql";
import PoeApi from "../services/poe/poe-api";
import PostgresService from "../services/mongo/postgres-service";
import { GqlUserProfile } from "../models/basic-models";
import { PoeStackContext } from "..";
import DiscordService from "../services/discord-service";
import TftService from "../services/tft-service";
import { Logger } from "../services/logger";
import CharacterSnapshotService from "../services/snapshot/character-snapshot-service";

@Resolver()
@singleton()
export class UserResolver {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly discordService: DiscordService,
    private readonly tftService: TftService,
    private readonly characterSnapshotService: CharacterSnapshotService
  ) {}

  @Query(() => Boolean)
  public async checkTftMembership(
    @Ctx() ctx: PoeStackContext,
    @Arg("forcePull", { nullable: true }) forcePull: boolean
  ) {
    const resp = await this.postgresService.prisma.userProfile.findUnique({
      where: { userId: ctx.userId },
    });

    if (!forcePull) {
      if (!resp.discordUserId) {
        return false;
      }

      if (
        resp.tftMemberUpdatedAtTimestamp &&
        new Date().getTime() - resp.tftMemberUpdatedAtTimestamp.getTime() <
          1000 * 60 * 30
      ) {
        return resp.tftMember === true;
      }
    }

    let membership = null;
    try {
      membership = await this.tftService.checkTftMembership(resp.discordUserId);
    } catch (error) {
      Logger.error("error pulling discord membership", error);
    }

    await this.postgresService.prisma.userProfile.update({
      where: { userId: ctx.userId },
      data: { tftMember: membership, tftMemberUpdatedAtTimestamp: new Date() },
    });

    return true;
  }

  @Mutation(() => Boolean)
  public async updateDiscordCode(
    @Ctx() ctx: PoeStackContext,
    @Arg("code") code: string
  ) {
    const userId = await this.discordService.exchangeTokenForUserId(code);
    if (userId) {
      await this.postgresService.prisma.userProfile.update({
        where: { userId: ctx.userId },
        data: {
          discordUserId: userId,
          discordUserIdUpdatedAtTimestamp: new Date(),
        },
      });
    }

    return true;
  }

  @Query(() => GqlUserProfile)
  public async profileByPoeProfileName(
    @Ctx() ctx: PoeStackContext,
    @Arg("poeProfileName") poeProfileName: string
  ) {
    const resp = await this.postgresService.prisma.userProfile.findFirst({
      where: {
        poeProfileName: { equals: poeProfileName, mode: "insensitive" },
      },
      select: { userId: true, poeProfileName: true },
    });
    return resp;
  }

  @Query(() => GqlUserProfile)
  public async myProfile(@Ctx() ctx: PoeStackContext) {
    const resp = await this.postgresService.prisma.userProfile.findUnique({
      where: { userId: ctx.userId },
    });
    return resp;
  }

  @Mutation(() => String)
  public async exchangeAuthCode(@Arg("authCode") authCode: string) {
    const accessToken = await this.poeApi.exchangeForToken(authCode);
    if (!accessToken) {
      throw new Error("Invalid auth code.");
    }

    const { data: poeProfile } = await this.poeApi.fetchProfile(accessToken);
    const userId = poeProfile?.uuid;
    if (!userId) {
      throw new Error("Failed to fetch poe profile.");
    }

    const userProfile = {
      userId,
      poeProfileName: poeProfile.name,
      createdAtTimestamp: new Date(),
      lastConnectedTimestamp: new Date(),
      oAuthToken: accessToken,
      oAuthTokenUpdatedAtTimestamp: new Date(),
    };

    await this.postgresService.prisma.userProfile.upsert({
      where: { userId: userId },
      create: userProfile,
      update: {
        lastConnectedTimestamp: new Date(),
        poeProfileName: poeProfile.name,
        oAuthToken: accessToken,
        oAuthTokenUpdatedAtTimestamp: new Date(),
      },
    });

    try {
      await this.characterSnapshotService.updatePoeCharacters(userId);
    } catch (error) {
      Logger.error("error during initial load characters", error);
    }

    const token = jwt.sign(
      {
        userId,
        poeProfileName: poeProfile.name,
      },
      process.env.JWT_SECRET
    );
    return token;
  }
}

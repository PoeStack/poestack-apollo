import jwt from "jsonwebtoken";
import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver, Mutation } from "type-graphql";
import PoeApi from "../services/poe/poe-api";
import PostgresService from "../services/mongo/postgres-service";
import { GqlUserProfile, GqlUserNotification } from "../models/basic-models";
import { PoeStackContext } from "..";
import DiscordService from "../services/discord-service";
import { Logger } from "../services/logger";
import TftOneClickService from "../services/tft/tft-one-click-service";
import { UserProfile } from "@prisma/client";
import { nanoid } from "nanoid";
import PatreonService from "../services/patreon-service";

@Resolver()
@singleton()
export class UserResolver {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly discordService: DiscordService,
    private readonly tftService: TftOneClickService,
    private readonly patreonService: PatreonService
  ) {
  }

  @Query(() => Boolean)
  public async checkTftMembership(
    @Ctx() ctx: PoeStackContext,
    @Arg("forcePull", { nullable: true }) forcePull: boolean
  ) {
    const resp = await this.postgresService.prisma.userProfile.findUnique({
      where: { userId: ctx.userId }
    });

    if (!resp.discordUserId) {
      return false;
    }

    if (!forcePull) {
      if (
        resp.tftMemberUpdatedAtTimestamp &&
        new Date().getTime() - resp.tftMemberUpdatedAtTimestamp.getTime() <
        1000 * 60 * 5
      ) {
        return resp.tftMember === true;
      }
    }

    let membership = null;
    let restricted = null;
    try {
      membership = await this.tftService.checkUserIsMember(resp.discordUserId);
      if (membership) {
        restricted = membership.roles.cache.some((e) =>
          e.name === "Trade Restricted"
        );
      }

    } catch (error) {
      Logger.error("error pulling discord membership", error);
    }

    await this.postgresService.prisma.userProfile.update({
      where: { userId: ctx.userId },
      data: { tftMember: membership, tftMemberUpdatedAtTimestamp: new Date(), tftRestricted: restricted }
    });

    return !!membership;
  }

  @Mutation(() => Boolean)
  public async updateDiscordCode(
    @Ctx() ctx: PoeStackContext,
    @Arg("code") code: string
  ) {
    const discordUserInfo = await this.discordService.exchangeTokenForUserId(
      code
    );
    if (discordUserInfo?.id) {
      await this.postgresService.prisma.userProfile.update({
        where: { userId: ctx.userId },
        data: {
          discordUserId: discordUserInfo.id,
          discordUsername: discordUserInfo.username,
          discordUserIdUpdatedAtTimestamp: new Date()
        }
      });
    }

    return true;
  }

  @Mutation(() => Boolean)
  public async updatePatreonCode(
    @Ctx() ctx: PoeStackContext,
    @Arg("code") code: string
  ) {
    const patreonCode = await this.patreonService.exchangeCode(code);

    if (patreonCode) {
      await this.postgresService.prisma.userProfile.update({
        where: { userId: ctx.userId },
        data: {
          patreonUserId: patreonCode,
          patreonUpdatedAtTimestamp: new Date()
        }
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
        poeProfileName: { equals: poeProfileName, mode: "insensitive" }
      },
      select: { userId: true, poeProfileName: true }
    });
    return resp;
  }

  @Query(() => [GqlUserNotification])
  public async myNotifications(@Ctx() ctx: PoeStackContext) {
    const resp = await this.postgresService.prisma.userNotification.findMany({
      where: {
        OR: [{ userId: null }, { userId: ctx.userId }],
        timestamp: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) }
      }
    });
    return resp;
  }

  @Query(() => GqlUserProfile)
  public async myProfile(@Ctx() ctx: PoeStackContext) {
    const resp = await this.postgresService.prisma.userProfile.findUnique({
      where: { userId: ctx.userId }
    });

    const date = new Date();
    await this.postgresService.prisma.userProfile.updateMany({
      where: { userId: ctx.userId },
      data: { lastConnectedTimestamp: date }
    });

    return resp;
  }

  @Mutation(() => Boolean)
  public async updatePreferenceListingPercent(
    @Ctx() ctx: PoeStackContext,
    @Arg("listingPercent") listingPercent: number
  ) {
    const user = await this.postgresService.prisma.userProfile.findUnique({
      where: { userId: ctx.userId }
    });

    await this.postgresService.prisma.userProfile.update({
      where: { userId: ctx.userId },
      data: {
        preferences: {
          ...(user.preferences as any),
          listingPercent: listingPercent
        }
      }
    });

    return true;
  }

  @Mutation(() => String)
  public async loginAs(
    @Ctx() ctx: PoeStackContext,
    @Arg("userId") userId: string
  ) {
    const requestingUser =
      await this.postgresService.prisma.userProfile.findUnique({
        where: { userId: ctx.userId }
      });
    if (!requestingUser.roles.includes("admin")) {
      throw new Error("Admin access required.");
    }

    const resp = await this.postgresService.prisma.userProfile.findUnique({
      where: { userId: userId }
    });
    const token = jwt.sign(
      {
        userId,
        poeProfileName: resp.poeProfileName
      },
      process.env.JWT_SECRET
    );
    return token;
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

    const userProfile: UserProfile = {
      userId: userId,
      poeProfileName: poeProfile.name,
      createdAtTimestamp: new Date(),
      lastConnectedTimestamp: new Date(),
      oAuthToken: accessToken,
      oAuthTokenUpdatedAtTimestamp: new Date(),
      discordUserId: null,
      discordUsername: null,
      discordUserIdUpdatedAtTimestamp: null,
      tftMember: null,
      tftRestricted: null,
      tftMemberUpdatedAtTimestamp: null,
      opaqueKey: nanoid(),
      patreonUserId: null,
      patreonTier: null,
      patreonUpdatedAtTimestamp: null,
      preferences: {},
      roles: []
    };

    await this.postgresService.prisma.userProfile.upsert({
      where: { userId: userId },
      create: userProfile,
      update: {
        lastConnectedTimestamp: new Date(),
        poeProfileName: poeProfile.name,
        oAuthToken: accessToken,
        oAuthTokenUpdatedAtTimestamp: new Date()
      }
    });

    const token = jwt.sign(
      {
        userId,
        poeProfileName: poeProfile.name
      },
      process.env.JWT_SECRET
    );
    return token;
  }
}

import fs from "fs";
import { PoeStackContext } from "index";
import {
  GqlStashViewAutomaticSnapshotSettings,
  GqlTftLiveListing,
  GqlTftLiveListingSearch,
} from "../models/basic-models";
import PostgresService from "../services/mongo/postgres-service";
import TftDiscordBotService from "services/tft/tft-discord-bot-service";
import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Prisma } from "@prisma/client";
import { TftDiscordServerConfig } from "services/tft/tft-one-click-service";

@Resolver()
@singleton()
export class TftLiveListingsResolver {
  private config: TftDiscordServerConfig;

  constructor(
    private readonly postgresService: PostgresService,
    private discordBotService: TftDiscordBotService,
  ) {
    this.config = JSON.parse(
      fs.readFileSync("data/tft/discord-bulk-listing-config.json").toString()
    );
  }

  @Query(() => [GqlTftLiveListing])
  async tftLiveListings(@Ctx() ctx: PoeStackContext) {
    if (!ctx?.userId) {
      throw new Error("Not authorized.");
    }

    const user = await this.postgresService.prisma.userProfile.findFirstOrThrow(
      { where: { userId: ctx.userId } }
    );

    if (!user) {
      throw new Error(`User ${ctx.userId} not found.`);
    }

    const memberUser = await this.discordBotService.fetchGuildMember(
      user.discordUserId,
      this.config.severId,
      true
    );
    if (!memberUser) {
      throw new Error(
        `User ${user.discordUsername} ${user.discordUserId} is not a member of the server`
      );
    }

    const userHasBadRoles = memberUser.roles.cache.some((e) =>
      e.name === "Trade Restricted"
    );
    if (userHasBadRoles) {
      throw new Error(
        `User ${user.discordUsername} ${user.discordUserId} is trade restricted`
      );
    }

    const tftLiveListings =
      await this.postgresService.prisma.tftLiveListing.findMany({
        where: {
          tag: "five-way",
          delistedAtTimestamp: null,
          updatedAtTimestamp: { gte: new Date(Date.now() - 1000 * 60 * 15) },
        },
        orderBy: { updatedAtTimestamp: "desc" },
      });
    return tftLiveListings;
  }

  @Query(() => [GqlTftLiveListing])
  async tftLiveListingSearch(
    @Ctx() ctx: PoeStackContext,
    @Arg("search") search: GqlTftLiveListingSearch
  ) {
    if (!ctx?.userId) {
      throw new Error("Not authorized.");
    }

    const globalSearchConditions: Prisma.Sql[] = [
      Prisma.sql`tll."tag" = ${search.tag} and tll."updatedAtTimestamp" > now() at time zone 'utc' - INTERVAL '30 mins'`,
    ];

    for (const filterGroup of search.propertyFilterGroups) {
      const subSearchConditions: Prisma.Sql[] = [];
      for (const filter of filterGroup.filters) {
        const jsonB = `{${filter.key}}`;
        const filterSql = Prisma.sql`(tll.properties#>${jsonB}::text[])::int >= ${parseInt(
          filter.value
        )}::int`;
        subSearchConditions.push(filterSql);
      }

      globalSearchConditions.push(
        Prisma.join(subSearchConditions, " and ", "(", ")")
      );
    }

    const where = Prisma.sql`where ${Prisma.join(
      globalSearchConditions,
      " and "
    )}`;

    const tftLiveListings = await this.postgresService.prisma.$queryRaw`
    select * from "TftLiveListing" tll
    ${where}
    order by tll."updatedAtTimestamp" desc`;
    return tftLiveListings;
  }
}

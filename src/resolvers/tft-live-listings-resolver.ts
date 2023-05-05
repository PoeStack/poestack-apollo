import { PoeStackContext } from "index";
import {
  GqlStashViewAutomaticSnapshotSettings,
  GqlTftLiveListing,
  GqlTftLiveListingSearch,
} from "../models/basic-models";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { Arg, Ctx, Query, Resolver } from "type-graphql";
import { Prisma } from "@prisma/client";

@Resolver()
@singleton()
export class TftLiveListingsResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => [GqlTftLiveListing])
  async tftLiveListings(@Ctx() ctx: PoeStackContext) {
    if (!ctx?.userId) {
      throw new Error("Not authorized.");
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

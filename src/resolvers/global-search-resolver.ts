import { Arg, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import {
  GqlGlobalSearch,
  GqlGlobalSearchResponse,
} from "../models/basic-models";

@Resolver()
@singleton()
export class GlobalSearchResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => GqlGlobalSearchResponse)
  async globalSearch(@Arg("search") search: GqlGlobalSearch) {
    const resp: GqlGlobalSearchResponse = { results: [] };

    const searchRegex = `%${search.searchText
      .toLowerCase()
      .split(" ")
      .join("%")}%`;

    const itemGroupKeys: Array<{
      key: string;
      icon: string;
      displayName: string;
    }> = await this.postgresService.prisma.$queryRaw`
    select key, avg(value) as avgValue, min(ig.icon) as icon, min(ig."displayName") as "displayName" from "ItemGroupInfo" ig
    left join  "ItemGroupPValue" igp ON ig."hashString" = igp."hashString"
    where igp."league" = ${search.league} and igp."type" = 'p10' and igp."stockRangeStartInclusive" = 0 and ig."key" like ${searchRegex}
    group by key
    order by avgValue desc limit 20`;

    resp.results.push(
      ...itemGroupKeys.map((ig) => ({
        group: "items",
        display: ig.displayName ?? ig.key,
        target: `/poe/economy/${
          search.league
        }/item-group?key=${encodeURIComponent(ig.key)}`,
        icon: ig.icon,
      }))
    );

    return resp;
  }
}

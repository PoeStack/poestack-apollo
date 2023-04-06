import { Prisma } from "@prisma/client";
import { singleton } from "tsyringe";
import {
  type GqlItemGroupSearch,
  type GqlItemGroup,
} from "../models/basic-models";
import PostgresService from "./mongo/postgres-service";

@singleton()
export default class ItemGroupService {
  constructor(private readonly postgresService: PostgresService) {}

  public async search(
    itemGroupSearch: GqlItemGroupSearch
  ): Promise<GqlItemGroup[]> {
    const searchConditions: Prisma.Sql[] = [
      Prisma.sql`p."type" = 'p10' and p."stockRangeStartInclusive" = 0 and p."league" = ${itemGroupSearch.league}`,
    ];
    if (itemGroupSearch.itemGroupHashKeys?.length) {
      searchConditions.push(
        Prisma.sql`g.key in (${Prisma.join(itemGroupSearch.itemGroupHashKeys)})`
      );
    }
    if (itemGroupSearch.itemGroupHashTags?.length) {
      searchConditions.push(
        Prisma.sql`g."tag" in (${Prisma.join(
          itemGroupSearch.itemGroupHashTags
        )})`
      );
    }
    if (itemGroupSearch.itemGroupHashStrings?.length) {
      searchConditions.push(
        Prisma.sql`g."hashString" in (${Prisma.join(
          itemGroupSearch.itemGroupHashStrings
        )})`
      );
    }
    const where =
      searchConditions.length > 0
        ? Prisma.sql`where ${Prisma.join(searchConditions, " and ")}`
        : Prisma.empty;

    const itemGroups: GqlItemGroup[] = await this.postgresService.prisma
      .$queryRaw`
      select * from "ItemGroupInfo" g 
      inner join "ItemGroupPValue" p ON g."hashString" = p."hashString"
      ${where}
      order by p.value ${
        itemGroupSearch.sortDirection === 1 ? Prisma.sql`asc` : Prisma.sql`desc`
      }
      limit ${itemGroupSearch.limit ?? 30} offset ${itemGroupSearch.skip ?? 0}
    `;
    return itemGroups;
  }
}

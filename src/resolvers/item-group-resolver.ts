import { S3Service } from "./../services/s3-service";
import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";
import LivePricingService from "../services/live-pricing/live-pricing-service";
import _ from "lodash";

export class ItemGroupSummary {
  hash: string;
  value: number;
  properties: any;
  searchableString: string;
}

@Resolver()
@singleton()
export class ItemGroupResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly livePricing: LivePricingService,
    private readonly s3Service: S3Service
  ) {}

  @Query(() => Boolean)
  async itemGroupInfo() {
    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      {}
    );

    const tags = _.uniq(itemGroups.map((e) => e.tag));
    for (const tag of tags) {
      const summaries: ItemGroupSummary[] = [];
      for (const itemGroup of itemGroups.filter((e) => e.tag === tag)) {
        const valuation = await this.livePricing.livePriceSimple(
          { itemGroupHashString: itemGroup.hashString },
          { league: "Crucible" }
        );
        const summary: ItemGroupSummary = {
          hash: itemGroup.hashString,
          searchableString: itemGroup.displayName ?? itemGroup.key,
          value: valuation?.value ?? 0,
          properties: itemGroup.properties,
        };
        summaries.push(summary);
      }

      const sortedSummaries = summaries.sort((a, b) => b.value - a.value);
      await this.s3Service.putJson(
        "poe-stack-public",
        `item-groups/tag_${tag}.json`,
        {
          entries: sortedSummaries.map((e) => [
            e.hash,
            e.searchableString,
            e.properties,
          ]),
        }
      );
    }

    return true;
  }

  @Query(() => [String])
  async itemGroupTags(@Arg("league") league: string) {
    const tags = await this.postgresService.prisma.itemGroupInfo.findMany({
      distinct: ["tag"],
      select: { tag: true },
    });
    return tags.map((e) => e.tag).sort();
  }

  @Query(() => Float)
  async itemGroupValueChaos(
    @Arg("league") league: string,
    @Arg("key") key: string
  ) {
    const value =
      await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
        league,
        key
      );
    return value;
  }
}

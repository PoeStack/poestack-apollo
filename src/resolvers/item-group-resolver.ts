import { S3Service } from "./../services/s3-service";
import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemValueHistoryService from "../services/pricing/item-value-history-service";
import { GqlSearchableItemGroupSummary } from "../models/basic-models";
import LivePricingService from "../services/live-pricing/live-pricing-service";

@Resolver()
@singleton()
export class ItemGroupResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly livePricing: LivePricingService,
    private readonly s3Service: S3Service
  ) {}

  @Query(() => [GqlSearchableItemGroupSummary])
  async itemGroupInfo() {
    const itemGroups = await this.postgresService.prisma.itemGroupInfo.findMany(
      {}
    );

    const searchableSummaries: Record<string, GqlSearchableItemGroupSummary> =
      {};
    for (const itemGroup of itemGroups) {
      if (searchableSummaries[itemGroup.key]) {
        continue;
      }

      const valuation = await this.livePricing.livePriceSimple(
        { itemGroupHashString: itemGroup.hashString },
        { league: "Crucible" }
      );

      if (valuation?.value) {
        const summary: GqlSearchableItemGroupSummary = {
          key: itemGroup.key,
          icon: itemGroup.icon,
          tag: itemGroup.tag,
          value: valuation.value,
        };
        if (itemGroup.displayName) {
          summary.displayName = itemGroup.displayName;
        }
        searchableSummaries[itemGroup.key] = summary;
      }
    }

    const summaries = [...Object.values(searchableSummaries)].sort(
      (a, b) => b.value - a.value
    );
    summaries.forEach((e) => {
      delete e.value;
    });

    await this.s3Service.putJson(
      "poe-stack-public",
      "item-groups/all-summaries.json",
      {
        summaries: summaries,
      }
    );

    return null;
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

import { S3Service } from "./../services/s3-service";
import { Arg, Float, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
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
    private readonly livePricing: LivePricingService,
    private readonly s3Service: S3Service
  ) {}
}

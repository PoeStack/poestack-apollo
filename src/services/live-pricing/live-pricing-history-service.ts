import { S3Service } from "../s3-service";
import { GqlItemGroupListing } from "../../models/basic-models";
import { Logger } from "../logger";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import LiveListingService from "./live-listing-service";

@singleton()
export default class LivePricingHistoryService {
  constructor(
    private readonly postgresService: PostgresService,
    private s3Service: S3Service,
    private liveListingService: LiveListingService
  ) {}

  
}

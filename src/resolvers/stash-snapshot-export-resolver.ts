import { Arg, Resolver, Mutation, Ctx } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import ItemGroupExporterService from "../services/item-data-export/item-group-exporter-service";
import {
  GqlStashSnapshotExport,
  GqlStashSnapshotExportInput,
} from "../models/basic-models";
import { PoeStackContext } from "..";

@Resolver()
@singleton()
export class StashSnapshotExportResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly itemGroupExporterService: ItemGroupExporterService
  ) {}

  @Mutation(() => GqlStashSnapshotExport)
  async exportStashSnapshot(
    @Ctx() ctx: PoeStackContext,
    @Arg("input") input: GqlStashSnapshotExportInput
  ) {
    const resp = await this.itemGroupExporterService.exportItemData(
      ctx.userId,
      input
    );
    return resp;
  }
}

import { Arg, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import { PassiveTreeService } from "../services/passive-tree/passive-tree-service";
import { GqlPassiveTreeResponse } from "../models/skill-tree-models";

@Resolver()
@singleton()
export class PassiveTreeResolver {
  constructor(private readonly passiveTreeService: PassiveTreeService) {}

  @Query(() => GqlPassiveTreeResponse)
  async passiveTree(@Arg("passiveTreeVersion") league: string) {
    const resp = this.passiveTreeService.passiveTree.getResponse();
    return resp;
  }

  @Query(() => GqlPassiveTreeResponse)
  async atlasTree(@Arg("passiveTreeVersion") league: string) {
    const resp = this.passiveTreeService.atlasTree.getResponse();
    return resp;
  }
}

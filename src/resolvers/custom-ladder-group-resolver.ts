import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import PostgresService from "../services/mongo/postgres-service";
import { singleton } from "tsyringe";
import { PoeStackContext } from "..";
import {
  GqlCustomLadderGroup,
  GqlCustomLadderGroupInput,
} from "../models/basic-models";
import { CustomLadderGroup } from "@prisma/client";

@Resolver()
@singleton()
export class CustomLadderGroupResolver {
  constructor(private readonly postgresService: PostgresService) {}

  @Query(() => GqlCustomLadderGroup)
  async customLadderGroup(
    @Ctx() ctx: PoeStackContext,
    @Arg("groupId") groupId: string
  ) {
    const resp = await this.postgresService.prisma.customLadderGroup.findFirst({
      where: { id: groupId },
    });
    return resp;
  }

  @Query(() => [GqlCustomLadderGroup])
  async customLadderGroupsByOwner(
    @Ctx() ctx: PoeStackContext,
    @Arg("ownerId") ownerId: string
  ) {
    const resp = await this.postgresService.prisma.customLadderGroup.findMany({
      where: { ownerUserId: ownerId },
    });
    return resp;
  }

  @Mutation(() => Boolean)
  async deleteCustomLadderGroup(
    @Ctx() ctx: PoeStackContext,
    @Arg("groupId") groupId: string
  ) {
    const resp = await this.postgresService.prisma.customLadderGroup.delete({
      where: { id_ownerUserId: { id: groupId, ownerUserId: ctx.userId } },
    });
    return true;
  }

  @Mutation(() => GqlCustomLadderGroup)
  async updateCustomLadderGroup(
    @Ctx() ctx: PoeStackContext,
    @Arg("group") groupInput: GqlCustomLadderGroupInput
  ) {
    const resp = await this.postgresService.prisma.customLadderGroup.upsert({
      where: { id_ownerUserId: { id: groupInput.id, ownerUserId: ctx.userId } },
      create: {
        id: groupInput.id,
        ownerUserId: ctx.userId,
        name: groupInput.name,
        members: groupInput.members as unknown as any,
        createdAtTimestamp: new Date(),
      },
      update: {
        name: groupInput.name,
        members: groupInput.members as unknown as any,
      },
    });
    return resp;
  }
}

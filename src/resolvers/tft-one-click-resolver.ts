import { GqlOneClickMessageHistory } from "./../models/basic-models";
import { GqlStashViewItemSummary } from "../models/basic-models";
import { PoeStackContext } from "../index";

import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { singleton } from "tsyringe";
import PostgresService from "../services/mongo/postgres-service";
import TftDiscordBotService from "../services/tft/tft-discord-bot-service";

@Resolver()
@singleton()
export class TftOneClickResolver {
  constructor(
    private readonly postgresService: PostgresService,
    private tftDiscordBotService: TftDiscordBotService
  ) {}

  @Query(() => [GqlOneClickMessageHistory])
  async tftOneClickMessageHistory(@Ctx() ctx: PoeStackContext) {
    if (!ctx?.userId) {
      throw new Error("Not authorized.");
    }

    const messages =
      await this.postgresService.prisma.oneClickMessageHistory.findMany({
        where: { userId: ctx.userId },
        orderBy: { timestamp: "desc" },
        take: 25,
      });
    return messages;
  }

  @Mutation(() => Boolean)
  async deleteTftOneClickMessage(
    @Ctx() ctx: PoeStackContext,
    @Arg("messageId") messageId: string
  ) {
    const message =
      await this.postgresService.prisma.oneClickMessageHistory.findFirst({
        where: { userId: ctx.userId, messageId: messageId },
      });
    if (message) {
      await this.tftDiscordBotService.deleteMessage(
        message.channelId,
        message.messageId
      );
      return true;
    }
    return false;
  }
}

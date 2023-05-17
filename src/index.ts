import "reflect-metadata";

import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { StashViewResolver } from "./resolvers/stash-view-resolver";
import { TftChannelParserService } from "./services/tft/message-parser/tft-channel-parser-service";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";

import PublicStashStreamService from "./services/pricing/public-stash-stream-service";
import { buildSchema } from "type-graphql";
import { container } from "tsyringe";
import { TftLiveListingsResolver } from "./resolvers/tft-live-listings-resolver";
import DiscordService from "./services/discord-service";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import { UserResolver } from "./resolvers/user-resolver";
import { PoeResolver } from "./resolvers/poe-resolver";
import { TftOneClickResolver } from "./resolvers/tft-one-click-resolver";
import { ItemGroupResolver } from "./resolvers/item-group-resolver";
import { ItemGroupValueTimeseriesResolver } from "./resolvers/item-group-value-timeseries-resolver";
import { Logger } from "./services/logger";
import { GlobalSearchResolver } from "./resolvers/global-search-resolver";
import { CharacterSnapshotResolver } from "./resolvers/character-snapshot-resolver";
import PobService from "./services/pob-service";
import { PassiveTreeResolver } from "./resolvers/passive-tree-resolver";
import { PassiveTreeService } from "./services/passive-tree/passive-tree-service";
import CharacterSnapshotService from "./services/snapshot/character-snapshot-service";
import { AtlasPassiveSnapshotResolve } from "./resolvers/atlas-passive-snapshot-resolver";
import { CustomLadderGroupResolver } from "./resolvers/custom-ladder-group-resolver";
import ItemGroupingService from "./services/pricing/item-grouping-service";
import ItemValueHistoryStreamService from "./services/pricing/item-value-history-stream-service";
import CharacterVectorService from "./services/snapshot/character-vector-service";
import TftBlacklistService from "./services/tft/utils/tft-blacklist-service";
import TftDiscordBotService from "./services/tft/tft-discord-bot-service";
import { PoeStackResolver } from "./resolvers/poestack-resolver";
import { LivePricingResolver } from "./resolvers/live-pricing-resolver";
import LivePricingHistoryService from "./services/live-pricing/live-pricing-history-service";
import StashViewSnapshotService from "./services/stash-view/stash-view-snapshot-service";

dotenv.config({ path: ".env.local" });

export interface PoeStackContext {
  userId: string;
}

process
  .on("unhandledRejection", (reason, p) => {
    container
      .resolve(DiscordService)
      .ping(`Unhandled Rejection at Promise : ${reason}`);
    console.error(reason, "Unhandled Rejection at Promise", reason);
  })
  .on("uncaughtException", (err) => {
    container
      .resolve(DiscordService)
      .ping(`Unhandled Rejection at Promise : ${err.name} : ${err.message}`);
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });

(async () => {
  const contextGenerator = async ({ req }) => {
    const token: string = req.headers.authorization
      ?.replace("Bearer ", "")
      ?.toString();
    let jwtData: PoeStackContext = { userId: null };
    if (token) {
      try {
        jwtData = jwt.verify(token, process.env.JWT_SECRET) as PoeStackContext;
      } catch (err) {
        Logger.info("failed to decode jwt");
      }
    }

    return jwtData;
  };

  const app = express();
  const myPlugin = {
    async requestDidStart(requestContext) {
      const start = Date.now();
      return {
        async willSendResponse(requestContext) {
          Logger.info("gql response", {
            userId: requestContext?.contextValue?.userId,
            operationName: requestContext?.operationName,
            duration: Date.now() - start,
            reqIp: requestContext?.request?.http?.headers
              ?.get("x-forwarded-for")
              ?.split(",")?.[0],
          });
        },
      };
    },
  };

  const httpServer = http.createServer(app);
  const schema = await buildSchema({
    resolvers: [
      PoeResolver,
      UserResolver,
      ItemGroupResolver,
      ItemGroupValueTimeseriesResolver,
      GlobalSearchResolver,
      CharacterSnapshotResolver,
      PassiveTreeResolver,
      AtlasPassiveSnapshotResolve,
      CustomLadderGroupResolver,
      StashViewResolver,
      TftOneClickResolver,
      TftLiveListingsResolver,
      PoeStackResolver,
      LivePricingResolver,
    ],
    validate: false,
    container: {
      get: (cls) => {
        return container.resolve(cls);
      },
    },
  });
  const server = new ApolloServer<PoeStackContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), myPlugin],
    cache: new InMemoryLRUCache({
      maxSize: Math.pow(2, 20) * 100,
      ttl: 1000 * 10,
    }),
  });
  await server.start();
  app.use(cors());
  app.use(express.json());

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: contextGenerator,
    })
  );

  container.resolve(PassiveTreeService).load();

  Logger.info("starting in dev : " + process.env.DEV);

  await new Promise<void>((resolve) =>
    httpServer.listen(
      {
        port: 4000,
        host: "0.0.0.0",
      },
      resolve
    )
  );

  Logger.info("🚀 Server ready at http://0.0.0.0:4000/graphql");

  container.resolve(ItemGroupingService).startWriteJob();

  if (process.env.CONSUME_STREAMS === "true") {
    container.resolve(PublicStashStreamService).startTailingPublicStashStream();
    container
      .resolve(PublicStashStreamService)
      .startWritingPublicStashUpdates();
  }

  if (process.env.START_HISTORY_WRITES === "true") {
    container.resolve(ItemValueHistoryStreamService).startHistoryInserts();
  }

  if (process.env.START_POB === "true") {
    container.resolve(PobService).startPobStream();
  }

  if (process.env.START_LIVE_PRICING_HISTORY_JOB === "true") {
    container.resolve(LivePricingHistoryService).startBackgroundJob();
  }

  if (process.env.START_POB_BACKGROUND_JOB === "true") {
    container
      .resolve(CharacterSnapshotService)
      .startCharacterSnapshotBackgroundJob();
    container
      .resolve(CharacterSnapshotService)
      .startAtlasAndPoeCharacterBackgroundJob();
    container.resolve(CharacterVectorService).startBackgroundJob();
  }

  if (process.env.START_STASH_VIEW_AUTOMATIC_SNAPSHOTS === "true") {
    container.resolve(StashViewSnapshotService).startAutomaticSnapshotJob();
  }

  if (process.env.START_ONE_CLICK_JOB === "true") {
    await container.resolve(TftBlacklistService).pullBlacklist();
    container.resolve(TftBlacklistService).startBlacklistUpdateTask();
    container.resolve(TftDiscordBotService).start();
  }

  if (process.env.START_TFT_PARSER === "true") {
    container.resolve(TftChannelParserService).start();
  }

  //await container.resolve(StashViewService).test();

  // await container.resolve(PoeNinjaAuditService).runAduit();

  /*   if (process.env.START_UPDATE_TWITCH_STREAMERS === "true") {
    container.resolve(TwitchService).startStreamerJob();
  } */

  container.resolve(DiscordService).start();
})();

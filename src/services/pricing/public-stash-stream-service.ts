import PoeApi from "../poe/poe-api";
import { type PoeApiPublicStashResponse } from "@gql/resolvers-types";

import ItemGroupingService from "./item-grouping-service";
import ItemValueHistoryService from "./item-value-history-service";
import StopWatch from "../utils/stop-watch";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import DiscordService from "../discord-service";
import { Logger } from "../logger";
import { S3Service } from "../s3-service";
import _ from "lodash";
import { RePoeService } from "../re-poe-service";

@singleton()
export default class PublicStashStreamService {
  updateQueue: PoeApiPublicStashResponse[] = [];

  constructor(
    private readonly poeApi: PoeApi,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly postgresService: PostgresService,
    private readonly discordService: DiscordService,
    private readonly s3Service: S3Service,
    private readonly rePoeService: RePoeService
  ) {}

  private diffChangeIds(rawIdOne: string, rawIdTwo: string): number[] {
    const idOne = rawIdOne.split("-").map((e) => parseInt(e));
    const idTwo = rawIdTwo.split("-").map((e) => parseInt(e));

    const result = [];
    for (let i = 0; i < idOne.length; i++) {
      result.push(idOne[i] - idTwo[i]);
    }
    return result;
  }

  private async updatePublicListingSummaries(
    response: PoeApiPublicStashResponse
  ) {
    const updateDate = new Date();

    const sw = new StopWatch();
    sw.start("map");
    const toWrite = {};

    const stashUpdates = [...response.stashes];
    while (stashUpdates.length > 0) {
      const publicStashUpdate = stashUpdates.shift();

      const stashSummary = {
        _id: publicStashUpdate.id,
        accountName: publicStashUpdate.accountName,
        league: publicStashUpdate.league,
        itemSummaries: [],
      };

      for (const item of publicStashUpdate.items) {
        if (item.lockedToAccount || item.lockedToCharacter) {
          continue;
        }

        const note = item.note ?? item.forum_note ?? publicStashUpdate.stash;
        if (note?.trim()?.length > 4) {
          const noteValue = await this.fetchNoteValue(
            publicStashUpdate.league,
            note
          );
          if (noteValue && noteValue > 0) {
            const group = this.itemGroupingService.findOrCreateItemGroup(item);

            if (group) {
              if (group.key === "rogue's marker" && noteValue >= 1) {
                continue;
              }

              const summary = {
                itemId: item.id,
                itemGroupHashKey: group.key,
                itemGroupHashString: group.hashString,
                stackSize: item.stackSize ?? 1,
                valueChaos: noteValue,
              };
              stashSummary.itemSummaries.push(summary);
            }
          }
        }
      }

      toWrite[stashSummary._id] = stashSummary;
    }
    sw.stop("map");

    await this.executeListingUpdates(toWrite);
  }

  private async updateStashListingRecords(response: PoeApiPublicStashResponse) {
    const stashUpdates = response.stashes;
    for (const chunks of _.chunk(stashUpdates, 20)) {
      const promises = chunks.map(async (e) => {
        if (e.league) {
          await this.postgresService.prisma.poePublicStashUpdateRecord.upsert({
            where: { publicStashId: e.id },
            update: {
              stashName: e.stash,
              updatedAtTimestamp: new Date(),
              delisted: false,
              stashType: e.stashType,
            },
            create: {
              league: e.league,
              publicStashId: e.id,
              poeProfileName: e.accountName,
              createdAtTimestamp: new Date(),
              updatedAtTimestamp: new Date(),
              delisted: false,
              stashName: e.stash,
              stashType: e.stashType,
            },
          });
        } else {
          await this.postgresService.prisma.poePublicStashUpdateRecord.updateMany(
            {
              where: { publicStashId: e.id },
              data: { delisted: true, updatedAtTimestamp: new Date() },
            }
          );
        }
      });

      await Promise.all(promises);
    }
  }

  public async startWritingPublicStashUpdates() {
    for (;;) {
      try {
        if (this.updateQueue.length > 0) {
          const toWrite = this.updateQueue.shift();

          await this.updateStashListingRecords(toWrite);
          await this.updatePublicListingSummaries(toWrite);

          await this.postgresService.prisma.genericParam.upsert({
            where: { key: "last_tracked_public_stash_change_id" },
            create: {
              key: "last_tracked_public_stash_change_id",
              valueString: toWrite.next_change_id,
            },
            update: { valueString: toWrite.next_change_id },
          });
        }
        await new Promise((res) => setTimeout(res, 10));
      } catch (error) {
        Logger.error("error in update queue consume.", error);
      }
    }
  }

  public async startTailingPublicStashStream() {
    const dbLastChangeId =
      await this.postgresService.prisma.genericParam.findFirst({
        where: { key: "last_tracked_public_stash_change_id" },
      });

    let pullCount = 0;
    let lastChangeId =
      dbLastChangeId?.valueString ??
      (await this.poeApi.fetchCurrentChangeIds());
    for (;;) {
      const startMs = Date.now();
      try {
        const resp = await this.poeApi.fetchPublicStashChanges(
          process.env.POE_PS_SERVICE_TOKEN,
          lastChangeId
        );
        if (resp.data) {
          pullCount++;
          this.updateQueue.push(resp.data);
          if (this.updateQueue.length > 20) {
            this.discordService.ping(
              "public stash warning: updateQueue falling behind."
            );
            Logger.info("public stash warning: updateQueue falling behind.");
          }
          lastChangeId = resp.data?.next_change_id;
        }

        Logger.info(
          `public stash pull completed in ${Date.now() - startMs}ms, ${
            this.updateQueue.length
          } update in queue`
        );

        if (resp.rateLimitedForMs > 0) {
          Logger.info("public stash delay", resp.rateLimitedForMs);
          await new Promise((res) => setTimeout(res, resp.rateLimitedForMs));
        }

        if (pullCount > 500) {
          pullCount = 0;
          const liveChangeId = await this.poeApi.fetchCurrentChangeIds();
          const idDiff = this.diffChangeIds(liveChangeId, lastChangeId);
          this.discordService.ping(
            `public stash id drift ${idDiff?.join(", ")}`
          );
        }
      } catch (error) {
        Logger.error("public stash error during pulling update", error);
      }
    }
  }

  private async executeListingUpdates(toWrite: any) {
    try {
      const postgresEntries = Object.values(toWrite).flatMap((s: any) => {
        return s.itemSummaries.map((e) => ({
          publicStashId: s._id,
          league: s.league,
          accountName: s.accountName,
          listedAtTimestamp: new Date(),
          itemGroupHashKey: e.itemGroupHashKey,
          itemGroupHashString: e.itemGroupHashString,
          stackSize: e.stackSize,
          listedValueChaos: e.valueChaos,
        }));
      });

      const sw = new StopWatch(true);
      sw.start("delete");

      const toDelete = _.uniq(postgresEntries.map((e) => e.publicStashId));
      for (const chunk of _.chunk(toDelete, 5)) {
        await this.postgresService.prisma.publicStashListing.deleteMany({
          where: { publicStashId: { in: chunk } },
        });
      }
      sw.stop("delete");

      sw.start("write");
      const writeResp =
        await this.postgresService.prisma.publicStashListing.createMany({
          data: postgresEntries,
        });
      sw.stop("write");
      sw.stop();

      Logger.info(
        `pg overall ${sw.elapsedMS()}ms [delete(${
          toDelete.length
        }) ${sw.elapsedMS("delete")}ms write(${writeResp.count}) ${sw.elapsedMS(
          "write"
        )}ms]`
      );
    } catch (error) {
      Logger.error("error during wrte", error);
    }
  }

  private async fetchNoteValue(league: string, note: string): Promise<number> {
    try {
      if (note.includes("~b/o ") || note.includes("~price ")) {
        const noteSplit = note.trim().split(" ");
        const valueString = noteSplit[1];
        const currenyType = noteSplit[2]?.toLowerCase();

        if (note.length < 3) {
          return -1;
        }

        let value;
        if (valueString.includes("/")) {
          const valueSplit = valueString.split("/");
          value = parseFloat(valueSplit[0]) / parseFloat(valueSplit[1]);
        } else {
          value = parseFloat(valueString);
        }

        const mappings = {
     /*      alch: "orb of alchemy", */
          chaos: "chaos orb",
          /* exalt: "exalted orb", */
          /* ex: "exalted orb", */
          c: "chaos orb",
          d: "divine orb",
          div: "divine orb",
          divine: "divine orb",
/*           "orb of alchemy": "orb of alchemy", */
          "chaos orb": "chaos orb",
    /*       "exalted orb": "exalted orb", */
          "divine orb": "divine orb",
        };

        const baseCurrencyType = league.toLowerCase().includes("ruthless")
          ? "orb of alchemy"
          : "chaos orb";

        if (mappings[currenyType] === baseCurrencyType) {
          return value;
        } else if (mappings[currenyType]) {
          const altCurrenyType = mappings[currenyType];
          const altCurrencyValue =
            await this.itemValueHistoryService.fetchFirstPValueByItemGroupHashKey(
              league,
              altCurrenyType
            );

          if (altCurrencyValue) {
            return value * altCurrencyValue;
          }
        }
      }
    } catch (error) {
      Logger.debug("Failed to prase note: " + note);
    }
    return -1;
  }
}

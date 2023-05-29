import PoeApi from "../poe/poe-api";
import { type PoeApiPublicStashResponse } from "@gql/resolvers-types";

import ItemGroupingService from "./item-grouping-service";
import StopWatch from "../utils/stop-watch";
import PostgresService from "../mongo/postgres-service";
import { singleton } from "tsyringe";
import DiscordService from "../discord-service";
import { Logger } from "../logger";
import _ from "lodash";
import { PoeLiveListing } from "@prisma/client";
import LivePricingService from "../../services/live-pricing/live-pricing-service";

@singleton()
export default class PublicStashStreamService {
  updateQueue: PoeApiPublicStashResponse[] = [];
  poeProfileActivityRecord: Record<string, Date> = {};

  constructor(
    private readonly poeApi: PoeApi,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly postgresService: PostgresService,
    private readonly discordService: DiscordService,
    private readonly livePricingService: LivePricingService
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

  private async writePoeLiveListings(response: PoeApiPublicStashResponse) {
    const sw = new StopWatch();
    sw.start("map");
    const listingsToWrite: Record<string, PoeLiveListing[]> = {};

    const stashUpdates = [...response.stashes];
    while (stashUpdates.length > 0) {
      const publicStashUpdate = stashUpdates.shift();
      this.poeProfileActivityRecord[publicStashUpdate.accountName] = new Date();

      const listingsMap: Record<string, PoeLiveListing> = {};
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

              const listing = listingsMap[group.hashString];
              if (!listing) {
                listingsMap[group.hashString] = {
                  publicStashId: publicStashUpdate.id,
                  itemGroupHashString: group.hashString,
                  quantity: item.stackSize ?? 1,
                  league: publicStashUpdate.league,
                  listedAtTimestamp: new Date(),
                  listedValue: noteValue,
                  poeProfileName: publicStashUpdate.accountName,
                };
              } else {
                listing.quantity += item.stackSize ?? 1;
              }
            }
          }
        }
      }

      listingsToWrite[publicStashUpdate.id] = Object.values(listingsMap);
    }
    sw.stop("map");

    await this.executeListingUpdates(listingsToWrite);
  }

  public async writePoeProfileActivity() {
    const records = this.poeProfileActivityRecord;
    if (Object.values(records).length > 50) {
      this.poeProfileActivityRecord = {};

      const promises = Object.entries(records).map(
        async ([poeProfileName, timestamp]) => {
          await this.postgresService.prisma.poeLiveProfileActivityRecord.upsert(
            {
              where: { poeProfileName: poeProfileName },
              create: {
                poeProfileName: poeProfileName,
                lastActiveTimestamp: timestamp,
              },
              update: { lastActiveTimestamp: timestamp },
            }
          );
        }
      );

      await Promise.all(promises);
    }
  }

  public async startWritingPublicStashUpdates() {
    for (;;) {
      try {
        if (this.updateQueue.length > 0) {
          const toWrite = this.updateQueue.shift();

          await this.writePoeLiveListings(toWrite);

          try {
            await this.writePoeProfileActivity();
          } catch (error) {
            Logger.error("error in write poe profile activity", error);
          }

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

  private async executeListingUpdates(
    toWrite: Record<string, PoeLiveListing[]>
  ) {
    try {
      const entires: PoeLiveListing[] = Object.values(toWrite).flatMap(
        (e) => e
      );

      const sw = new StopWatch(true);
      sw.start("delete");

      const toDelete = _.uniq(entires.map((e) => e.publicStashId));
      for (const chunk of _.chunk(toDelete, 5)) {
        await this.postgresService.prisma.poeLiveListing.deleteMany({
          where: { publicStashId: { in: chunk } },
        });
      }
      sw.stop("delete");

      sw.start("write");
      const writeResp =
        await this.postgresService.prisma.poeLiveListing.createMany({
          data: entires,
        });
      sw.stop("write");
      sw.stop();

      Logger.debug(
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
          chaos: "chaos orb",
          c: "chaos orb",
          d: "divine orb",
          div: "divine orb",
          divine: "divine orb",
          "chaos orb": "chaos orb",
          "divine orb": "divine orb",
        };

        const baseCurrencyType = "chaos orb";

        if (mappings[currenyType] === baseCurrencyType) {
          return value;
        } else if (mappings[currenyType]) {
          const altCurrenyType = mappings[currenyType];
          const altCurrencyValue =
            await this.livePricingService.livePriceSimpleByKey(
              league,
              altCurrenyType
            );

          if (altCurrencyValue?.value) {
            return value * altCurrencyValue?.value;
          }
        }
      }
    } catch (error) {
      Logger.debug("Failed to prase note: " + note);
    }
    return -1;
  }
}

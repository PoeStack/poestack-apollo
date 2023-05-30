import PostgresService from "../../services/mongo/postgres-service";
import { S3Service } from "../../services/s3-service";
import { singleton } from "tsyringe";
import PobService from "../../services/pob-service";
import _ from "lodash";
import { CustomDataVector } from "../../services/utils/custom-data-vector";
import { LadderViewSnapshotRecord } from "@prisma/client";
import { LadderViewVectorFields } from "./ladder-view-models";

@singleton()
export class LadderViewVectorService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly s3Service: S3Service,
    private readonly pobService: PobService
  ) {}

  private updateVector(
    dataVector: CustomDataVector,
    rank: number,
    entry: LadderViewVectorEntry,
    snapshot: LadderViewSnapshotRecord
  ) {
    const vector = [];

    const apiFields: LadderViewVectorFields =
      snapshot.characterApiFields as any;
    dataVector.addVectorValues(vector, "allItemKeys", apiFields.allItemKeys);
    dataVector.addVectorValues(vector, "allSkillKeys", apiFields.allSkillKeys);
    dataVector.addVectorValues(
      vector,
      "mainSkillKeys",
      apiFields.mainSkillKeys
    );
    dataVector.addVectorValues(vector, "keyStoneKeys", apiFields.keyStoneKeys);
    dataVector.addVectorValues(vector, "masteryKeys", apiFields.masteryKeys);
    dataVector.addVectorValues(vector, "general", [
      apiFields.pantheonMajor,
      apiFields.pantheonMinor,
      apiFields.enchant,
      apiFields.weaponCategory,
      apiFields.bandit,
      entry.patreonTier,
      entry.twitchProfileName,
    ]);

    //Don't put the chaos value in there it's too long, maybe split pages by rank instead of by level

    vector.push(["r", snapshot.characterOpaqueKey, apiFields.level, rank]);

    dataVector.output.vectors.push(vector);
  }

  public async updateVectors(league: string) {
    const validSnapshotsEntries: LadderViewVectorEntry[] = await this
      .postgresService.prisma
      .$queryRaw`select sr."userId", sr."timestamp", sr."characterOpaqueKey", pc."lastLevel", up."patreonTier", sp."profileName" as "twitchProfileName" from "LadderViewSnapshotRecord" sr
      left join "PoeCharacter" pc on pc."opaqueKey" = sr."characterOpaqueKey"
      left join "UserProfile" up on sr."userId" = up."userId" 
      left join "TwitchStreamerProfile" sp on sp."userId" = up."userId" 
      where sr."characterApiFields" != 'null' and sr."characterPobFields" != 'null' and sr."league" = ${league}
      order by pc."lastLevel" desc, pc."lastSnapshotTimestamp" asc`;

    const chunks = _.chunk(validSnapshotsEntries, 1000);
    let rank = 0;
    const dataVector = new CustomDataVector();
    for (const chunk of chunks) {
      const snapshots =
        await this.postgresService.prisma.ladderViewSnapshotRecord.findMany({
          where: { timestamp: { in: chunk.map((e) => e.timestamp) } },
        });
      for (const entry of chunk) {
        rank++;
        const snapshot = snapshots.find(
          (e) =>
            e.timestamp.getTime() === entry.timestamp.getTime() &&
            e.userId === entry.userId &&
            e.characterOpaqueKey === entry.characterOpaqueKey
        );
        this.updateVector(dataVector, rank, entry, snapshot);
      }
    }

    dataVector.invertRelations();

    const timestamp = new Date();
    const allEntries = dataVector.output.vectors;
    const entriesChunks = _.chunk(allEntries, 25000);

    const header = {
      totalChunks: entriesChunks.length,
      totalEntries: allEntries.length,
      timestamp: timestamp.toISOString(),
    };

    await this.postgresService.prisma.ladderViewVectorRecord.create({
      data: { league: league, timestamp: timestamp },
    });
    await this.s3Service.putJson(
      "poe-stack-ladder-view",
      `vectors/${league}/vectors/${timestamp.toISOString()}/header.json`,
      header
    );
    await this.s3Service.putJson(
      "poe-stack-ladder-view",
      `vectors/${league}/vectors/${timestamp.toISOString()}/values.json`,
      { types: dataVector.output.types, values: dataVector.output.values }
    );

    let index = 0;
    for (const chunk of entriesChunks) {
      await this.s3Service.putJson(
        "poe-stack-ladder-view",
        `vectors/${league}/vectors/${timestamp.toISOString()}/entries_${index++}.json`,
        { entries: chunk }
      );
    }

    await this.s3Service.putJson(
      "poe-stack-ladder-view",
      `vectors/${league}/current.json`,
      header
    );
    console.log(dataVector);
  }

  public async startJob() {
    for (;;) {
      const leagues = ["Crucible"];
      for (const league of leagues) {
        await this.updateVectors(league);
      }

      await new Promise((res) => setTimeout(res, 1000 * 60 * 30));
    }
  }
}

export interface LadderViewVectorEntry {
  userId: string;
  timestamp: Date;
  characterOpaqueKey: string;
  lastLevel: number;
  twitchProfileName: string;
  patreonTier: string;
}

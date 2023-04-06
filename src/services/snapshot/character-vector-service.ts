import { S3Service } from "./../s3-service";
import PostgresService from "../mongo/postgres-service";

import { singleton } from "tsyringe";
import { Logger } from "../logger";
import { CustomDataVector } from "../utils/custom-data-vector";

@singleton()
export default class CharacterVectorService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly s3Service: S3Service
  ) {}

  public async startBackgroundJob() {
    for (;;) {
      try {
        const leagues: { league: string }[] = await this.postgresService.prisma
          .$queryRaw`select distinct "league" from "CharacterSnapshotSearchableSummary2" `;
        for (const league of leagues) {
          try {
            await this.build(league.league);
          } catch (error) {
            Logger.error("error during character league vector write", error);
          }
        }
      } catch (error) {
        Logger.error("error during character vector write", error);
      }

      await new Promise((res) => setTimeout(res, 1000 * 60 * 10));
    }
  }

  private async build(league: string) {
    const customVector = new CustomDataVector();
    const snapshots =
      await this.postgresService.prisma.characterSnapshotSearchableSummary2.findMany(
        { where: { league: league } }
      );

    for (const snapshot of snapshots) {
      const vector = [];

      customVector.addVectorValues(vector, "general", [
        snapshot.characterClass,
        snapshot.mainSkillKey,
      ]);

      customVector.addVectorValues(vector, "itemKeys", snapshot.itemKeys);
      customVector.addVectorValues(
        vector,
        "passiveNodeKeys",
        snapshot.passiveNodeKeys
      );
      customVector.addVectorValues(
        vector,
        "topItemNames",
        snapshot.topItems.map((e: any) => e.name),
        "itemKeys"
      );
      customVector.addVectorValues(
        vector,
        "topItemIcons",
        snapshot.topItems.map((e: any) => e.icon)
      );
      vector.push([
        "r",
        snapshot.characterId,
        snapshot.snapshotId,
        snapshot.name,
        snapshot.pobDps,
        snapshot.level,
        snapshot.life,
        snapshot.energyShield,
        snapshot.totalValueChaos,
        snapshot.totalValueDivine,
        snapshot.userId,
        snapshot.twitchProfileName,
      ]);

      customVector.output.vectors.push(vector);
    }

    if (customVector.output.vectors.length) {
      customVector.invertRelations();

      const snapshotDate = new Date();
      snapshotDate.setUTCHours(0, 0, 0, 0);

      await this.s3Service.putJson(
        "poe-stack-poe-ladder-vectors",
        `${league}/current.json`,
        customVector.output
      );
      await this.s3Service.putJson(
        "poe-stack-poe-ladder-vectors",
        `${league}/${snapshotDate.toISOString()}.json`,
        customVector.output
      );
    }
  }
}

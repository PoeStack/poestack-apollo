import PostgresService from "../../services/mongo/postgres-service";
import { S3Service } from "../../services/s3-service";
import { singleton } from "tsyringe";
import { LadderViewSnapshot } from "./ladder-view-models";
import PobService from "../../services/pob-service";
import { nanoid } from "nanoid";

@singleton()
export class LadderViewPobService {
  constructor(
    private readonly postgresService: PostgresService,
    private readonly s3Service: S3Service,
    private readonly pobService: PobService
  ) {}

  public async updateSnapshotPob(
    userId: string,
    characterOpaqueKey: string,
    snapshotTimestamp: Date
  ) {
    const resp =
      await this.postgresService.prisma.ladderViewSnapshotRecord.updateMany({
        where: {
          userId: userId,
          characterOpaqueKey: characterOpaqueKey,
          timestamp: snapshotTimestamp,
          lockKey: null,
        },
        data: { lockKey: nanoid(), lockTimestamp: new Date() },
      });

    if (resp.count === 0) {
      return;
    }

    const snapshot: LadderViewSnapshot = await this.s3Service.getJson(
      "poe-stack-ladder-view",
      `v1/snapshots/${characterOpaqueKey}/${snapshotTimestamp.toISOString()}/snapshot.json`
    );
    if (!snapshot) {
      return;
    }

    const pobResp = await this.pobService.handle(snapshot.poeApiCharacter);
    const pobStats = {};
    for (const [key, value] of Object.entries(pobResp)) {
      const formattedKey = `${key.slice(0, 1).toLowerCase()}${key.slice(1)}`;
      if (value === "true") {
        pobStats[formattedKey] = true;
      } else if (value === "false") {
        pobStats[formattedKey] = false;
      } else {
        try {
          pobStats[formattedKey] = parseFloat(`${value}`);
        } catch (error) {}
      }
    }

    await this.s3Service.putJson(
      "poe-stack-ladder-view",
      `v1/snapshots/${characterOpaqueKey}/${snapshotTimestamp.toISOString()}/pob.json`,
      { pobStats: pobStats }
    );

    await this.postgresService.prisma.ladderViewSnapshotRecord.updateMany({
      where: {
        userId: userId,
        characterOpaqueKey: characterOpaqueKey,
        timestamp: snapshotTimestamp,
      },
      data: {
        characterPobFields: {
          life: pobStats["life"],
          energyShield: pobStats["energyShield"],
          accuracy: pobStats["accuracy"],
          armour: pobStats["armour"],
          evasion: pobStats["evasion"],
          dex: pobStats["dex"],
          int: pobStats["int"],
          str: pobStats["str"],
          combinedDPS: pobStats["combinedDPS"],
          ward: pobStats["ward"],
          fireTotalHitPool: pobStats["fireTotalHitPool"],
          physicalTotalHitPool: pobStats["physicalTotalHitPool"],
          coldTotalHitPool: pobStats["coldTotalHitPool"],
          lightningTotalHitPool: pobStats["lightningTotalHitPool"],
          chaosTotalHitPool: pobStats["chaosTotalHitPool"],
        },
      },
    });

    await this.postgresService.prisma.ladderViewSnapshotRecord.update({
      where: {
        userId_characterOpaqueKey_timestamp: {
          userId: userId,
          characterOpaqueKey: characterOpaqueKey,
          timestamp: snapshotTimestamp,
        },
      },
      data: { snapshotStatus: "complete", lockKey: null, lockTimestamp: null },
    });

    console.log(snapshot, pobResp);
  }

  public async startJob() {
    for (;;) {
      await this.postgresService.prisma.ladderViewSnapshotRecord.updateMany({
        where: {
          lockTimestamp: { lte: new Date(Date.now() - 1000 * 60 * 10) },
        },
        data: { lockTimestamp: null, lockKey: null },
      });

      const jobs =
        await this.postgresService.prisma.ladderViewSnapshotRecord.findMany({
          where: {
            snapshotStatus: "awaiting pob update",
            lockKey: null,
          },
          take: 10,
        });

      for (const job of jobs) {
        await this.updateSnapshotPob(
          job.userId,
          job.characterOpaqueKey,
          job.timestamp
        );
      }
    }
  }
}

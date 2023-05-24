import { singleton } from "tsyringe";
import PoeApi from "../poe/poe-api";
import _ from "lodash";
import PostgresService from "../mongo/postgres-service";
import { PoeService } from "../poe/poe-service";
import { UserService } from "../user-service";
import ItemGroupingService from "../pricing/item-grouping-service";
import PobService from "../pob-service";
import { PassiveTreeService } from "../passive-tree/passive-tree-service";
import { S3Service } from "../s3-service";
import ItemValueHistoryService from "../pricing/item-value-history-service";
import AtlasPassiveSnapshotService from "../../services/snapshot/atlas-passive-snapshot-service";
import {
  PoeCharacter,
  TwitchStreamerProfile,
  UserProfile,
} from "@prisma/client";
import { PoeApiCharacter } from "@gql/resolvers-types";
import { LadderViewVectorFields } from "./ladder-view-models";
import { PoeApiItem } from "../../gql/__generated__/resolvers-types";
import { GeneralUtils } from "../../utils/general-util";
import LivePricingService from "../../services/live-pricing/live-pricing-service";

@singleton()
export class LadderViewSnapshotService {
  constructor(
    private readonly poeService: PoeService,
    private readonly poeApi: PoeApi,
    private readonly userService: UserService,
    private readonly postgresService: PostgresService,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly passiveTreeService: PassiveTreeService,
    private readonly pobService: PobService,
    private readonly s3Service: S3Service,
    private readonly atlasPassiveSnapshotService: AtlasPassiveSnapshotService,
    private readonly itemValueHistoryService: ItemValueHistoryService,
    private readonly livePricingService: LivePricingService
  ) {}

  private async takeSnapshotInternal(userId: string, characterId: string) {
    const ctx = await this.initContext(userId, characterId);
    if (ctx) {
      await this.mapCharacterData(ctx);
      await this.presistSnapshot(ctx);
    }
    console.log("asadasd");
  }

  private async mapCharacterData(ctx: LadderViewSnapshotContext) {
    await this.mapCharacterItems(ctx);

    const vectorFields: LadderViewVectorFields = {
      experience: ctx.poeApiCharacter.experience ?? 0,
    };
    ctx.vectorFields = vectorFields;
  }

  private async mapCharacterItems(ctx: LadderViewSnapshotContext) {
    const equipment = ctx.poeApiCharacter.equipment ?? [];
    const jewels = ctx.poeApiCharacter.jewels ?? [];
    const sockted = equipment
      .flatMap((baseItem) => {
        const subItems = baseItem.socketedItems?.map((e) => {
          return { ...e, ...{ socketedInId: baseItem.id } };
        });
        return subItems;
      })
      .filter((e) => !!e);

    const allItems: (PoeApiItem & {
      itemGroupHashString?: string | null | undefined;
    })[] = [...equipment, ...jewels, ...sockted].map((e) => ({
      ...e,
      itemGroupHashString:
        this.itemGroupingService.findOrCreateItemGroup(e)?.hashString,
    }));
    await this.livePricingService.injectPrices(allItems, {
      listingPercent: 10,
      league: ctx.poeApiCharacter.league,
    });

    ctx.items = allItems;
  }

  private async presistSnapshot(ctx: LadderViewSnapshotContext) {
    if (ctx.poeApiCharacter.level !== ctx.poeCharacter.lastLevel) {
      await this.postgresService.prisma.poeCharacter.update({
        where: { id: ctx.poeCharacter.id },
        data: {
          lastLevel: ctx.poeApiCharacter.level,
          lastLevelChangeTimestamp: ctx.timestamp,
        },
      });
    }

    await this.postgresService.prisma.ladderViewSnapshotRecord.updateMany({
      where: { characterId: ctx.poeCharacter.id },
      data: { lastestSnapshot: false },
    });
    await this.postgresService.prisma.ladderViewSnapshotRecord.create({
      data: {
        userId: ctx.userProfile.userId,
        characterId: ctx.poeCharacter.id,
        pobShardKey: GeneralUtils.random(0, 100),
        snapshotHashString: "NA",
        pobStatus: "awaiting generation",
        lastestSnapshot: true,
        timestamp: ctx.timestamp,
      },
    });
    await this.postgresService.prisma.ladderViewSnapshotVectorSummary.upsert({
      where: {
        userId_characterId: {
          userId: ctx.userProfile.userId,
          characterId: ctx.poeCharacter.id,
        },
      },
      create: {
        userId: ctx.userProfile.userId,
        characterId: ctx.poeCharacter.id,
        timestamp: ctx.timestamp,
        characterApiFields: ctx.vectorFields as any,
        characterPobFields: {},
      },
      update: {
        timestamp: ctx.timestamp,
        characterApiFields: ctx.vectorFields as any,
        characterPobFields: {},
      },
    });
  }

  private async initContext(
    userId: string,
    characterId: string
  ): Promise<LadderViewSnapshotContext | null> {
    const userProfile =
      await this.postgresService.prisma.userProfile.findFirstOrThrow({
        where: { userId },
        include: { twitchStreamerProfile: true },
      });
    const oAuthToken = userProfile?.oAuthToken;
    if (!oAuthToken) {
      return null;
    }

    const character =
      await this.postgresService.prisma.poeCharacter.findFirstOrThrow({
        where: { userId, id: characterId },
      });
    const { data: characterData } = await this.poeApi.fetchCharacter(
      oAuthToken,
      character.name
    );
    if (!characterData) {
      return null;
    }

    if (character.id !== characterData.id) {
      //TODO character detleted.
      return null;
    }

    const ctx: LadderViewSnapshotContext = {
      timestamp: new Date(),
      userProfile: userProfile,
      poeCharacter: character,
      poeApiCharacter: characterData,
    };
    return ctx;
  }

  public async takeSnapshot(userId: string, characterId: string) {
    await this.takeSnapshotInternal(userId, characterId);
  }
}
export interface LadderViewSnapshotContext {
  timestamp: Date;
  userProfile: UserProfile & {
    twitchStreamerProfile: TwitchStreamerProfile;
  };
  poeCharacter: PoeCharacter;
  poeApiCharacter: PoeApiCharacter;
  vectorFields?: LadderViewVectorFields;
  items?: PoeApiItem[];
}

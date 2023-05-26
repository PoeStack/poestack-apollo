import { singleton } from "tsyringe";
import PoeApi from "../poe/poe-api";
import _ from "lodash";
import PostgresService from "../mongo/postgres-service";
import ItemGroupingService from "../pricing/item-grouping-service";
import { PassiveTreeService } from "../passive-tree/passive-tree-service";
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
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly passiveTreeService: PassiveTreeService,
    private readonly livePricingService: LivePricingService
  ) {}

  private async takeSnapshotInternal(userId: string, characterId: string) {
    const ctx = await this.initContext(userId, characterId);
    if (ctx) {
      await this.mapCharacterData(ctx);
      await this.presistSnapshot(ctx);
    }
  }

  private async mapCharacterData(ctx: LadderViewSnapshotContext) {
    await this.mapItems(ctx);
    this.detectLooted(ctx);
    this.mapSkills(ctx);
    this.mapPassives(ctx);

    const vectorFields: LadderViewVectorFields = {
      experience: ctx.poeApiCharacter.experience ?? 0,
      mainSkillKeys: ctx.mainSkillKeys,
    };
    ctx.vectorFields = vectorFields;
  }

  private mapPassives(ctx: LadderViewSnapshotContext) {
    ctx.keyStoneKeys = [];
    ctx.masteryKeys = [];

    const hashes = ctx.poeApiCharacter.passives?.hashes ?? [];
    for (const hash of hashes) {
      const node = this.passiveTreeService.passiveTree.getNode(`${hash}`);
      if (node?.isKeystone) {
        ctx.keyStoneKeys.push(node.name);
      }
      if (node?.isMastery) {
        const effectHash =
          ctx.poeApiCharacter.passives["mastery_effects"][hash];
        if (effectHash) {
          const effect = node.masteryEffects?.find(
            (e) => e.effect === effectHash
          );
          if (effect) {
            ctx.masteryKeys.push(effect.stats.join(" "));
          }
        }
      }
    }
  }

  private detectLooted(ctx: LadderViewSnapshotContext) {}

  private mapSkills(ctx: LadderViewSnapshotContext) {
    const negativeSupports = [
      "feeding frenzy support",
      "enlighten support",
      "divine blessing support",
      "cast when damage taken support",
      "increased duration support",
      "generosity support",
      "mark on hit support",
      "hextouch support",
    ];
    const negativeSkills = [
      "flame dash",
      "shield charge",
      "frostblink",
      "frenzy",
      "plague bearer",
      "barrage",
      "cyclone",
      "kinetic blast",
    ];

    const socketedGems = ctx.items.filter(
      (e) => e.frameType === 4 && e.socketedInId
    );

    const mainSkills: Array<{
      key: string;
      supportScore: number;
      skillGemTypeScore: number;
    }> = socketedGems
      .filter((e) => !e.support)
      .map((gem) => {
        const equipment = ctx.items.find((e) => e.id === gem.socketedInId);
        const gemSocketGroup = equipment?.sockets?.[gem.socket ?? 0]?.group;

        const supports = socketedGems.filter((e) => {
          const supportSocketGroup = equipment?.sockets?.[e.socket ?? 0]?.group;
          return (
            e.support &&
            e.socketedInId === gem.socketedInId &&
            gemSocketGroup === supportSocketGroup
          );
        });

        const equipmentSupportCount =
          equipment?.explicitMods
            .map((e) => e.toLowerCase())
            .filter(
              (e) =>
                e.startsWith("socketed gems are supported by") ||
                e.startsWith("socketed spells have") ||
                e.startsWith("socketed gems have")
            )?.length ?? 0;

        const supportScore = _.sumBy(supports, (e) =>
          negativeSupports.includes(e.baseType?.toLowerCase()) ? 9 : 10
        );

        const key = gem.baseType.toLowerCase();
        const resp = {
          key,
          supportScore: supportScore + equipmentSupportCount * 10,
          skillGemTypeScore: key.includes("totem") ? 50 : 100,
        };

        if (key.startsWith("vaal ")) {
          resp.key = key.slice("vaal ".length);
          resp.skillGemTypeScore = resp.skillGemTypeScore - 10;
        }

        resp.skillGemTypeScore =
          resp.skillGemTypeScore - (negativeSkills.includes(resp.key) ? 10 : 0);

        if (["Offhand2", "Weapon2"].includes(equipment.inventoryId)) {
          resp.supportScore = 0;
        }

        return resp;
      });

    const itemSkills = ctx.items.filter((e) =>
      [
        "Arakaali's Fang",
        "Maw of Mischief",
        "Death's Oath",
        "The Whispering Ice",
      ].includes(e.name)
    );
    mainSkills.push(
      ...itemSkills.map((e) => ({
        key: e.name?.toLocaleLowerCase(),
        supportScore: 50,
        skillGemTypeScore: 100,
      }))
    );

    const sortedMainSkills = _.sortBy(mainSkills, [
      "supportScore",
      "skillGemTypeScore",
    ]);

    const mainSkillKeys = [];
    const skill1 = sortedMainSkills?.[sortedMainSkills.length - 1];
    mainSkillKeys.push(skill1?.key);

    const skill2 = sortedMainSkills?.[sortedMainSkills.length - 2];
    if (skill2 && skill1.supportScore === skill2.supportScore) {
      mainSkillKeys.push(skill2.key);
    }

    ctx.mainSkillKeys = mainSkillKeys.filter((e) => !!e);
    ctx.allSkillKeys = sortedMainSkills.map((e) => e.key);
  }

  private async mapItems(ctx: LadderViewSnapshotContext) {
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

    const mainHandItem = allItems.find((e) => e.inventoryId === "Weapon");
    const mainHandCategory = this.decodeIcon(mainHandItem?.icon);

    const offHandItem = allItems.find((e) => e.inventoryId === "Offhand");
    const offHandCategory = this.decodeIcon(offHandItem?.icon);

    ctx.weaponCategory = [mainHandCategory, offHandCategory]
      .filter((e) => !!e)
      .map((e) => e.slice(0, -1))
      .join("/");
  }

  private decodeIcon(icon: string) {
    if (!icon) {
      return null;
    }

    const split = icon.split("/");
    const base64String = split[5];
    const iconInfo = JSON.parse(
      Buffer.from(base64String, "base64").toString("ascii")
    )?.[2];
    const categoryString = iconInfo["f"]?.split("/");

    return categoryString?.[(categoryString?.length ?? 0) - 2];
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
        snapshotStatus: "awaiting generation",
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
  items?: (PoeApiItem & { socketedInId?: string })[];
  mainSkillKeys?: string[];
  allSkillKeys?: string[];
  keyStoneKeys?: string[];
  masteryKeys?: string[];
  weaponCategory?: string;
}

import { PoeLeagueStartService } from "./../poe/poe-league-start-service";
import { PoeApiCharacter } from "@gql/resolvers-types";
import {
  PoeCharacter,
  Prisma,
  TwitchStreamerProfile,
  UserProfile,
} from "@prisma/client";
import _ from "lodash";
import { singleton } from "tsyringe";
import { PoeApiItem } from "../../gql/__generated__/resolvers-types";
import LivePricingService from "../../services/live-pricing/live-pricing-service";
import PostgresService from "../mongo/postgres-service";
import { PassiveTreeService } from "../passive-tree/passive-tree-service";
import PoeApi from "../poe/poe-api";
import ItemGroupingService from "../pricing/item-grouping-service";
import { S3Service } from "./../s3-service";
import { LadderViewSnapshot, LadderViewApiFields } from "./ladder-view-models";
import objectHash from "object-hash";
import { Logger } from "../logger";
import { ItemUtils } from "../../utils/item-utils";
import { AtlasViewService } from "../atlas-view/atlas-view-service";

@singleton()
export class LadderViewSnapshotService {
  constructor(
    private readonly poeApi: PoeApi,
    private readonly postgresService: PostgresService,
    private readonly itemGroupingService: ItemGroupingService,
    private readonly passiveTreeService: PassiveTreeService,
    private readonly s3Service: S3Service,
    private readonly livePricingService: LivePricingService,
    private readonly poeLeagueStartService: PoeLeagueStartService,
    private readonly atlasViewService: AtlasViewService
  ) {}

  private async takeSnapshotInternal(userId: string, characterId: string) {
    const ctx = await this.initContext(userId, characterId);
    if (ctx) {
      await this.mapCharacterData(ctx);
      if (!ctx.looted) {
        await this.mapAtlas(ctx);
        this.generateHash(ctx);
        if (ctx.snapshotHash !== ctx.poeCharacter.ladderViewLastSnapshotHash) {
          await this.presistSnapshot(ctx);
        }
      }

      const delayHours =
        ctx.poeCharacter.lastLeague === "Standard" ? 24 * 7 : 12;
      await this.postgresService.prisma.poeCharacter.updateMany({
        where: { id: ctx.poeCharacter.id },
        data: {
          ladderViewNextSnapshotTimestamp: new Date(
            Date.now() + 1000 * 60 * 60 * delayHours
          ),
        },
      });
    }
  }

  private async mapAtlas(ctx: LadderViewSnapshotContext) {
    const snapshot = await this.atlasViewService.snapshot(
      ctx.userProfile.userId,
      ctx.poeApiCharacter.league
    );

    const validNodes = [
      "abyss",
      "blight",
      "delve",
      "incursion",
      "strongboxes",
      "essence",
      "betrayal",
      "harbinger",
      "metamorph",
      "shrines",
      "delirium",
      "breach",
      "bestiary",
      "legion",
      "heist",
      "expedition",
      "harvest",
      "ritual",
      "rogue exiles",
    ];

    const atlasNodeTypes = Object.entries(snapshot.hashTypeCounts).filter(
      ([type, count]: [string, number]) =>
        count >= 3 && validNodes.includes(type)
    );
    atlasNodeTypes.sort(
      (a: [string, number], b: [string, number]) => b[1] - a[1]
    );
    ctx.vectorFields.topAtlasNodeTypes = atlasNodeTypes
      .map(([type]) => type)
      .slice(0, 4);
  }

  private generateHash(ctx: LadderViewSnapshotContext) {
    const hashFields = {
      hashVersion: "2",
      level: ctx.poeApiCharacter.level,
      items: ctx.items ?? [],
      passives: ctx.poeApiCharacter.passives,
      league: ctx.poeApiCharacter.league,
    };
    const hash = objectHash(hashFields);
    ctx.snapshotHash = hash;
  }

  private async mapCharacterData(ctx: LadderViewSnapshotContext) {
    ctx.vectorFields = {};

    await this.mapItems(ctx);
    this.mapSkills(ctx);
    this.mapPassives(ctx);

    ctx.vectorFields.class = ctx.poeApiCharacter.class;
    ctx.vectorFields.characterName = ctx.poeApiCharacter.name ?? "NA";
    ctx.vectorFields.profileName = ctx.userProfile.poeProfileName ?? "NA";
    ctx.vectorFields.experience = ctx.poeApiCharacter.experience ?? 0;
    ctx.vectorFields.level = ctx.poeApiCharacter.level ?? 0;

    ctx.vectorFields.bandit = ctx.poeApiCharacter.passives?.bandit_choice;
    ctx.vectorFields.pantheonMajor =
      ctx.poeApiCharacter.passives?.pantheon_major;
    ctx.vectorFields.pantheonMinor =
      ctx.poeApiCharacter.passives?.pantheon_minor;

    this.detectLooted(ctx);
  }

  private mapPassives(ctx: LadderViewSnapshotContext) {
    ctx.vectorFields.keyStoneKeys = [];
    ctx.vectorFields.masteryKeys = [];

    const hashes = ctx.poeApiCharacter.passives?.hashes ?? [];
    for (const hash of hashes) {
      const node = this.passiveTreeService.passiveTree.getNode(`${hash}`);
      if (node?.isKeystone) {
        ctx.vectorFields.keyStoneKeys.push(node.name);
      }
      if (node?.isMastery) {
        const effectHash =
          ctx.poeApiCharacter.passives["mastery_effects"][hash];
        if (effectHash) {
          const effect = node.masteryEffects?.find(
            (e) => e.effect === effectHash
          );
          if (effect) {
            ctx.vectorFields.masteryKeys.push(effect.stats.join(" "));
          }
        }
      }
    }
  }

  private detectLooted(ctx: LadderViewSnapshotContext) {
    if (!ctx.vectorFields.mainSkillKeys.length) {
      ctx.looted = true;
    }
  }

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
            ?.map((e) => e.toLowerCase())
            ?.filter(
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

    ctx.vectorFields.mainSkillKeys = mainSkillKeys.filter((e) => !!e);
    ctx.vectorFields.allSkillKeys = sortedMainSkills.map((e) => e.key);
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

    ctx.vectorFields.totalValueChaos = Math.round(
      ctx.items.reduce((p, c) => (c["fixedValue"] ?? 0) + p, 0)
    );

    const mainHandItem = allItems.find((e) => e.inventoryId === "Weapon");
    const mainHandCategory = ItemUtils.decodeIcon(mainHandItem?.icon);

    const offHandItem = allItems.find((e) => e.inventoryId === "Offhand");
    const offHandCategory = ItemUtils.decodeIcon(offHandItem?.icon);

    const helm = allItems.find((e) => e.inventoryId === "Helm");
    ctx.vectorFields.enchant = helm?.enchantMods?.[0];
    ctx.vectorFields.helmCategory = ItemUtils.decodeIcon(helm?.icon, 0);
    ctx.vectorFields.helmBaseType = helm?.baseType?.toLowerCase();

    ctx.vectorFields.weaponCategory = [mainHandCategory, offHandCategory]
      .filter((e) => !!e)
      .map((e) => e.slice(0, -1))
      .join("/");

    ctx.vectorFields.allItemKeys = allItems
      .filter((e) => e.frameType == 3 || e.frameType == 10)
      .map((e) => e.name?.toLowerCase())
      .filter((e) => !!e);

    const trackedItems = allItems.filter(
      (e) => !!e["fixedValue"] && !!e.name && [3, 10].includes(e.frameType)
    );
    trackedItems.sort((a, b) => b["fixedValue"] - a["fixedValue"]);
    ctx.vectorFields.topItems = trackedItems
      .slice(0, 4)
      .map((e) => ({ name: e.name.toLowerCase(), icon: e.icon }));
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
      where: { characterOpaqueKey: ctx.poeCharacter.opaqueKey },
      data: {
        mostRecentSnapshot: false,
        characterApiFields: Prisma.JsonNull,
        characterPobFields: Prisma.JsonNull,
      },
    });
    await this.postgresService.prisma.ladderViewSnapshotRecord.create({
      data: {
        userId: ctx.userProfile.userId,
        characterOpaqueKey: ctx.poeCharacter.opaqueKey,
        snapshotHashString: "NA",
        league: ctx.poeApiCharacter.league,
        snapshotStatus: "init",
        mostRecentSnapshot: true,
        characterApiFields: ctx.vectorFields as any,
        characterPobFields: Prisma.JsonNull,
        timestamp: ctx.timestamp,
      },
    });

    const snapshot: LadderViewSnapshot = {
      userOpaqueKey: ctx.userProfile.opaqueKey,
      poeApiCharacter: ctx.poeApiCharacter,
    };

    await this.s3Service.putJson(
      "poe-stack-ladder-view",
      `v1/snapshots/${
        ctx.poeCharacter.opaqueKey
      }/${ctx.timestamp.toISOString()}/snapshot.json`,
      snapshot
    );

    await this.postgresService.prisma.poeCharacter.updateMany({
      where: { id: ctx.poeCharacter.id },
      data: {
        ladderViewLastSnapshotHash: ctx.snapshotHash,
        ladderViewLastSnapshotHashUpdateTimestamp: new Date(),
      },
    });

    await this.postgresService.prisma.ladderViewSnapshotRecord.update({
      where: {
        userId_characterOpaqueKey_timestamp: {
          userId: ctx.poeCharacter.userId,
          characterOpaqueKey: ctx.poeCharacter.opaqueKey,
          timestamp: ctx.timestamp,
        },
      },
      data: { snapshotStatus: "awaiting pob update" },
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

    await this.poeLeagueStartService.update(characterData.league);

    const ctx: LadderViewSnapshotContext = {
      timestamp: new Date(),
      userProfile: userProfile,
      poeCharacter: character,
      poeApiCharacter: characterData,
      looted: false,
    };
    return ctx;
  }

  public async takeSnapshot(userId: string, characterId: string) {
    await this.takeSnapshotInternal(userId, characterId);
  }

  private async runSweep() {
    const characters: { id: string; userId: string }[] = await this
      .postgresService.prisma.$queryRaw`
      select pc."userId", pc."id"  from "PoeCharacter" pc 
      left join "UserProfile" up on up."userId"  = pc."userId" 
      left join "TwitchStreamerProfile" tw on tw."userId"  = pc."userId" 
      where pc."ladderViewNextSnapshotTimestamp" < now() at time zone 'utc' and (up."patreonTier" is not null or tw."userId" is not null)
      order by random()
      limit 50`;

    await this.postgresService.prisma.poeCharacter.updateMany({
      where: { id: { in: characters.map((e) => e.id) } },
      data: {
        ladderViewNextSnapshotTimestamp: new Date(Date.now() + 1000 * 60 * 20),
      },
    });

    for (const character of characters) {
      try {
        await this.takeSnapshot(character.userId, character.id);
      } catch (error) {
        Logger.error("error in ladder view snapshot", error);
      }
    }
  }

  public async startJob() {
    for (;;) {
      try {
        await this.runSweep();
      } catch (error) {
        Logger.error("error in ladder view sweep", error);
      }
    }
  }
}
export interface LadderViewSnapshotContext {
  timestamp: Date;
  userProfile: UserProfile & {
    twitchStreamerProfile: TwitchStreamerProfile;
  };
  poeCharacter: PoeCharacter;
  poeApiCharacter: PoeApiCharacter;
  vectorFields?: LadderViewApiFields;
  snapshotHash?: string;
  looted?: boolean;
  items?: (PoeApiItem & { socketedInId?: string })[];
}

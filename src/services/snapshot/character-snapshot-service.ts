import PoeApi from "../poe/poe-api";
import _ from "lodash";
import { singleton } from "tsyringe";
import PostgresService from "../mongo/postgres-service";
import { PoeService } from "../poe/poe-service";
import { UserService } from "../user-service";
import {
  PoeCharacter,
  type CharacterSnapshotSearchableSummary2,
} from "@prisma/client";
import { nanoid } from "nanoid";
import { Logger } from "../logger";
import objectHash from "object-hash";
import {
  type PoeApiCharacter,
  type PoeApiItem,
} from "../../gql/__generated__/resolvers-types";
import ItemGroupingService from "../pricing/item-grouping-service";
import PobService from "../pob-service";
import { PassiveTreeService } from "../passive-tree/passive-tree-service";
import {
  type GqlCharacterSnapshot,
  type GqlCharacterSnapshotItem,
  type GqlCharacterSnapshotSearch,
  type GqlCharacterSnapshotSearchResponse,
} from "../../models/basic-models";
import { S3Service } from "../s3-service";
import AtlasPassiveSnapshotService from "./atlas-passive-snapshot-service";
import DiscordService from "../discord-service";

@singleton()
export default class CharacterSnapshotService {
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
    private readonly discordService: DiscordService
  ) {}

  public async searchSnapshots(
    search: GqlCharacterSnapshotSearch
  ): Promise<GqlCharacterSnapshotSearchResponse> {
    const snapshots =
      await this.postgresService.prisma.characterSnapshotSearchableSummary2.findMany(
        {
          where: {
            league: search.league,
            characterId: { in: search.includedCharacterIds },
          },
        }
      );

    const resp = {
      hasMore: false,
      snapshots: snapshots,
    };
    return resp as any as GqlCharacterSnapshotSearchResponse;
  }

  public async updatePoeCharacters(userId: string) {
    const oAuthToken = await this.userService.fetchUserOAuthTokenSafe(userId);

    const { data: allPoeCharacters } = await this.poeApi.fetchCharacters(
      oAuthToken
    );

    if (allPoeCharacters) {
      for (const character of allPoeCharacters) {
        await this.postgresService.prisma.poeCharacter.upsert({
          where: { id: character.id },
          create: {
            id: character.id,
            name: character.name,
            opaqueKey: nanoid(),
            userId: userId,
            createdAtTimestamp: new Date(),
            lastSnapshotTimestamp: undefined,
            lastLeague: character.league,
          },
          update: {
            name: character.name,
            lastLeague: character.league,
          },
        });
      }
    }
  }

  public async startAtlasAndPoeCharacterBackgroundJob() {
    for (;;) {
      await new Promise((res) => setTimeout(res, 1000 * 60 * 2));

      const users = await this.postgresService.prisma.userProfile.findMany({
        where: { oAuthToken: { not: null } },
        select: { userId: true },
      });
      for (const user of _.shuffle(users)) {
        try {
          await this.updatePoeCharacters(user.userId);
          await this.atlasPassiveSnapshotService.takeAtlasSnapshot(
            user.userId,
            "system"
          );
        } catch (error) {
          Logger.error("error in atlas and character update job", error);
        }
      }

      await new Promise((res) => setTimeout(res, 1000 * 60 * 20));
    }
  }

  public async startCharacterSnapshotBackgroundJob() {
    const take = 500;

    for (;;) {
      try {
        const charactersNew: PoeCharacter[] = await this.postgresService.prisma
          .$queryRaw`
          select pc.* from "PoeCharacter" pc 
          left join "UserProfile" up on pc."userId" = up."userId"
          where up."oAuthToken" is not null and "lastSnapshotTimestamp" is null
          limit ${take}`;

        const characters: PoeCharacter[] = await this.postgresService.prisma
          .$queryRaw`
          select pc.* from "PoeCharacter" pc 
          left join "UserProfile" up on pc."userId" = up."userId"
          where up."oAuthToken" is not null
          order by "lastSnapshotTimestamp" asc
          limit ${take}`;

        Logger.info(`character snapshot job pull`, {
          charactersNew: charactersNew?.length,
        });

        for (const character of _.shuffle([...charactersNew, ...characters])) {
          try {
            await this.takeSnapshot(character.userId, character.id, "system_5");
          } catch (error) {
            Logger.error(
              `error while taking character snapshot ${character?.id}`,
              error
            );
          }

          await new Promise((res) => setTimeout(res, 5));
        }
      } catch (error) {
        Logger.error(`error while taking character snapshots`, error);
      }
    }
  }

  public async takeSnapshot(
    userId: string,
    characterId: string,
    source: string
  ): Promise<boolean> {
    let res = false;

    const userProfile =
      await this.postgresService.prisma.userProfile.findFirstOrThrow({
        where: { userId },
        include: { twitchStreamerProfile: true },
      });
    const oAuthToken = userProfile?.oAuthToken;

    const snapshotDate = new Date();
    const characterUpdate = {
      lastSnapshotTimestamp: snapshotDate,
    };

    if (oAuthToken) {
      try {
        const character =
          await this.postgresService.prisma.poeCharacter.findFirstOrThrow({
            where: { userId, id: characterId },
          });

        const {
          data: characterData,
          status,
          rateLimitedForMs,
        } = await this.poeApi.fetchCharacter(oAuthToken, character.name);

        if (rateLimitedForMs > 0) {
          Logger.info("rate limited in chracter snapshot " + rateLimitedForMs);
          await new Promise((res) => setTimeout(res, rateLimitedForMs));
          return false;
        }

        if (!!status && status === 401) {
          await this.postgresService.prisma.userProfile.update({
            where: { userId: userId },
            data: {
              oAuthToken: null,
              oAuthTokenUpdatedAtTimestamp: new Date(),
            },
          });
        } else {
          if (characterData?.id === characterId) {
            characterData["lastLeague"] = characterData.league;

            const allItems = await this.extractItems(characterData);
            const mainSkillKey = this.determineMainSkill(allItems);
            const totalPValue = _.sumBy(allItems, (e) => e.valueChaos ?? 0);
            const bucketedPValue = Math.round(totalPValue / 500) * 500;

            const snapshotCharacterStateHash =
              this.generateCharacterSnapshotHash(
                "v7",
                characterData,
                mainSkillKey,
                bucketedPValue
              );
            characterUpdate["lastSnapshotHash"] = snapshotCharacterStateHash;

            if (
              source === "user" ||
              character.lastSnapshotHash !== snapshotCharacterStateHash
            ) {
              characterUpdate["lastSnapshotHashUpdateTimestamp"] = snapshotDate;

              const snapshot: GqlCharacterSnapshot = {
                userId: userId,
                id: nanoid(),
                poeProfileName: userProfile.poeProfileName,
                characterId: character.id,
                timestamp: snapshotDate.toUTCString(),
                characterClass: characterData.class,
                league: characterData.league,
                experience: BigInt(characterData.experience),
                level: characterData.level,
                current: characterData.current ?? false,
                characterSnapshotPobStats: null,
                characterSnapshotItems: allItems,
                mainSkillKey,
                totalValueChaos: null,
                totalValueDivine: null,
              };

              snapshot.characterPassivesSnapshot = {
                banditChoice: characterData.passives.bandit_choice,
                pantheonMajor: characterData.passives.pantheon_major,
                pantheonMinor: characterData.passives.pantheon_minor,
                hashes: characterData.passives.hashes,
                hashesEx: characterData.passives.hashes_ex,
                jewelData: characterData.passives["jewel_data"],
                masteryEffects: characterData.passives["mastery_effects"],
              };

              const importantPassiveNodeKeys = [];
              for (const hash of snapshot.characterPassivesSnapshot.hashes ??
                []) {
                const node = this.passiveTreeService.passiveTree.getNode(
                  `${hash}`
                );
                if (node) {
                  if (node.isKeystone) {
                    importantPassiveNodeKeys.push(node.name.toLowerCase());
                  }
                }
              }

              const parseSafe = (s) => {
                try {
                  return parseInt(s?.toString()?.trim() ?? "0");
                } catch (error) {
                  Logger.info("pob failed to parse: " + s);
                }
                return 0;
              };
              const pobRaw: any = await this.pobService.handle(characterData);
              if (!pobRaw) {
                Logger.error("pob failed to parse: " + character?.id);
              } else {
                snapshot.characterSnapshotPobStats = {
                  accuracy: parseSafe(pobRaw.Accuracy),
                  armour: parseSafe(pobRaw.Armour),
                  blockChance: parseSafe(pobRaw.BlockChance),
                  spellBlockChance: parseSafe(pobRaw.SpellBlockChance),
                  chaosResist: parseSafe(pobRaw.ChaosResist),
                  coldResist: parseSafe(pobRaw.ColdResist),
                  dex: parseSafe(pobRaw.Dex),
                  energyShield: parseSafe(pobRaw.EnergyShield),
                  fireResist: parseSafe(pobRaw.FireResist),
                  int: parseSafe(pobRaw.Int),
                  life: parseSafe(pobRaw.Life),
                  lightningResist: parseSafe(pobRaw.LightningResist),
                  mana: parseSafe(pobRaw.Mana),
                  str: parseSafe(pobRaw.Str),
                  evasion: parseSafe(pobRaw.Evasion),
                  totalDpsWithIgnite: parseSafe(pobRaw.WithIgniteDPS),
                  supression: parseSafe(pobRaw.SpellSuppressionChance),
                  pobCode: pobRaw.pobCode,
                };

                const topItems = allItems
                  .filter((e) => !!e.name && e.frameType === 3)
                  .sort((a, b) => (b.valueChaos ?? 0) - (a.valueChaos ?? 0))
                  .slice(0, 5)
                  .map((e) => ({ name: e.name.toLowerCase(), icon: e.icon }));

                const divChaosValue = 0;

                const searchableSummary: CharacterSnapshotSearchableSummary2 = {
                  snapshotId: snapshot.id,
                  characterId: snapshot.characterId,
                  userId: userId,
                  poeProfileName: userProfile.poeProfileName,
                  createdAtTimestamp: new Date(),
                  characterClass: snapshot.characterClass,
                  itemKeys: allItems
                    .filter((e) => e.frameType == 3 || e.frameType == 10)
                    .map((e) => e.name?.toLowerCase())
                    .filter((e) => !!e),
                  topItems: topItems,
                  league: snapshot.league,
                  mainSkillKey: mainSkillKey,
                  passiveNodeKeys: importantPassiveNodeKeys,
                  source: source,
                  twitchProfileName:
                    userProfile?.twitchStreamerProfile?.profileName,
                  systemSnapshotTimestamp: new Date(),
                  name: characterData.name,
                  level: characterData.level,
                  life: snapshot.characterSnapshotPobStats?.life,
                  energyShield:
                    snapshot.characterSnapshotPobStats?.energyShield,
                  totalValueChaos: Math.round(totalPValue),
                  totalValueDivine:
                    divChaosValue > 1 ? totalPValue / divChaosValue : null,
                  pobDps: Math.round(
                    snapshot?.characterSnapshotPobStats?.totalDpsWithIgnite ?? 0
                  ),
                };
                searchableSummary.systemSnapshotTimestamp.setUTCHours(
                  0,
                  0,
                  0,
                  0
                );

                snapshot.totalValueChaos = searchableSummary.totalValueChaos;
                snapshot.totalValueDivine = searchableSummary.totalValueDivine;

                await this.postgresService.prisma.characterSnapshotRecord.create(
                  {
                    data: {
                      id: snapshot.id,
                      userId,
                      characterId: snapshot.characterId,
                      timestamp: snapshotDate,
                      experience: snapshot.experience,
                      level: snapshot.level,
                      source,
                    },
                  }
                );
                await this.s3Service.putJson(
                  "poe-stack",
                  `character-snapshots/${snapshot.id}.json`,
                  snapshot
                );

                await this.postgresService.prisma.characterSnapshotSearchableSummary2.upsert(
                  {
                    where: {
                      characterId: snapshot.characterId,
                    },
                    update: searchableSummary,
                    create: searchableSummary,
                  }
                );

                res = true;
              }
            } else {
              Logger.info("skipping snapshot for " + characterId);
            }
          } else if (characterData?.id) {
            Logger.info(
              "character id did not match expected id, this character has likely been deleted: " +
                characterData?.id
            );
          }
        }
      } catch (error) {
        Logger.error("error in character snapshot " + characterId, error);
      }
    }

    await this.postgresService.prisma.poeCharacter.update({
      where: { id: characterId },
      data: characterUpdate,
    });
    Logger.info(`took snapshot ${characterId} : ${res}`);
    return res;
  }

  private async extractItems(
    characterData: PoeApiCharacter
  ): Promise<GqlCharacterSnapshotItem[]> {
    const mapToItem = async (
      e: PoeApiItem
    ): Promise<GqlCharacterSnapshotItem> => {
      const group = this.itemGroupingService.findOrCreateItemGroup(e);
      const resp = {
        itemId: e.id,
        inventoryId: e.inventoryId,
        baseType: e.baseType,
        typeLine: e.typeLine,
        name: e.name,
        ilvl: e["ilvl"] ?? e.itemLevel ?? 0,
        explicitMods: e.explicitMods ?? [],
        utilityMods: e.utilityMods ?? [],
        implicitMods: e?.implicitMods ?? [],
        enchantMods: e?.enchantMods ?? [],
        craftedMods: e?.craftedMods ?? [],
        influences: e.influences,
        fracturedMods: e.fracturedMods ?? [],
        properties: e.properties ?? [],
        requirements: e.requirements ?? [],
        frameType: e.frameType,
        flavourText: e.flavourText ?? [],
        description: e.descrText,
        icon: e.icon,
        w: e.w,
        h: e.h,
        crucible: e.crucible,
        corrupted: e.corrupted,
        gemColor: e.colour,
        socket: e.socket,
        sockets: e.sockets ?? [],
        support: e.support,
        socketedInId: null,
        itemGroupHashString: group?.hashString,
        valueChaos: null,
      };

      if (group) {
        const valueChaos = 0;
        if (valueChaos > 0) {
          resp.valueChaos = valueChaos;
        }
      }

      return resp;
    };

    const equipmentItem = characterData.equipment?.map(mapToItem) ?? [];

    const equipmentSocketedItems = characterData.equipment
      .flatMap((baseItem) => {
        const subItems = baseItem.socketedItems?.map(async (e) => {
          const m = await mapToItem(e);
          return { ...m, ...{ socketedInId: baseItem.id } };
        });
        return subItems;
      })
      .filter((e) => !!e);
    const jewelItems = characterData.jewels.map(mapToItem);

    const allItems = await Promise.all([
      ...equipmentItem,
      ...equipmentSocketedItems,
      ...jewelItems,
    ]);
    return allItems;
  }

  private determineMainSkill(items: GqlCharacterSnapshotItem[]): string {
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

    const socketedGems = items.filter(
      (e) => e.frameType === 4 && e.socketedInId
    );

    const mainSkills: Array<{
      key: string;
      supportScore: number;
      skillGemTypeScore: number;
    }> = socketedGems
      .filter((e) => !e.support)
      .map((gem) => {
        const equipment = items.find((e) => e.itemId === gem.socketedInId);
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

    const itemSkills = items.filter((e) =>
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
    const resp = sortedMainSkills?.[sortedMainSkills.length - 1]?.key;
    return resp;
  }

  private generateCharacterSnapshotHash(
    hashVersion: string,
    characterData: PoeApiCharacter,
    mainSkillKey: string,
    totalValueChaosBucket: number
  ): string {
    const hashItems = {
      hashVersion: hashVersion,
      class: characterData.class,
      xp: characterData.experience,
      passives: characterData.passives,
      equipment: characterData.equipment?.map((e) => e?.id),
      jewels: characterData.jewels?.map((e) => e?.id),
      mainSkillKey: mainSkillKey,
      league: characterData.league,
      totalValueChaosBucket: totalValueChaosBucket,
    };

    const hash = objectHash(hashItems, { unorderedArrays: true });
    return hash;
  }
}

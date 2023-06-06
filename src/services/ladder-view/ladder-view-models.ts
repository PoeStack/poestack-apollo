import { PoeApiCharacter } from "@gql/resolvers-types";

export interface LadderViewApiFields {
  name?: string;
  weaponCategory?: string;
  experience?: number;
  totalValueChaos?: number;
  class?: string;
  level?: number;
  keyStoneKeys?: string[];
  masteryKeys?: string[];
  mainSkillKeys?: string[];
  allSkillKeys?: string[];
  allItemKeys?: string[];
  enchant?: string;
  helmCategory?: string;
  helmBaseType?: string;

  bandit?: string;
  pantheonMajor?: string;
  pantheonMinor?: string;
}

export interface LadderViewPobFields {
  life: number;
  energyShield: number;
  accuracy: number;
  armour: number;
  evasion: number;
  dex: number;
  int: number;
  str: number;
  combinedDPS: number;
  ward: number;
  fireTotalHitPool: number;
  physicalTotalHitPool: number;
  coldTotalHitPool: number;
  lightningTotalHitPool: number;
  chaosTotalHitPool: number;
}

export interface LadderViewSnapshot {
  userOpaqueKey: string;
  poeApiCharacter: PoeApiCharacter;
}

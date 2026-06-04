export type SkinDictValue = number | string;

export interface SkinDictItem {
  value?: SkinDictValue;
  name?: string;
  label?: string;
  attributes?: Record<string, unknown>;
}

export interface SkinDictDisplayItem {
  value: string;
  name: string;
  iconPath?: string;
  iconUrl?: string;
}

export interface LolDictionaries {
  cnRarity: SkinDictItem[];
  globalRarity: SkinDictItem[];
  emblems: SkinDictItem[];
  championRoles: SkinDictItem[];
  championPositions: SkinDictItem[];
}

export interface Skin {
  id: number;
  riotSkinId: number;
  contentId?: string;
  championId: number;
  championName?: string;
  isBase?: number;
  name: string;
  nameEng?: string;
  description?: string;
  rarity?: string;
  regionRarityId?: number;
  isLegacy?: number;
  isPbeOnly?: number;
  releaseTime?: string;
  splashPath?: string;
  uncenteredSplashPath?: string;
  tilePath?: string;
  loadScreenPath?: string;
  rarityGemPath?: string;
  chromasJson?: string;
  skinlineIdSets?: string;
  skinlineNames?: string[];
  emblemNames?: string;
}

export interface Champion {
  id: number;
  heroId: number;
  name: string;
  nameEng?: string;
  title?: string;
  roles?: string;
  positions?: string[];
  squarePortraitPath?: string;
}

export interface Skinline {
  id: number;
  riotSkinlineId: number;
  name: string;
  engName?: string;
  description?: string;
}

export interface Universe {
  id: number;
  lolUniverseId: number;
  name: string;
  engName?: string;
  imagePath?: string;
  lolSkinlineIdSets?: string;
}

export interface HomeData {
  latestSkins: Skin[];
  featuredChampions: Champion[];
  skinlines: Skinline[];
  universes: Universe[];
  dictionaries: LolDictionaries;
}

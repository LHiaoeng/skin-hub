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
  isLegacyGlobal?: number;
  isPbeOnly?: number;
  skinType?: string;
  releaseTime?: string;
  splashPath?: string;
  uncenteredSplashPath?: string;
  tilePath?: string;
  chromaPath?: string;
  loadScreenPath?: string;
  loadScreenVintagePath?: string;
  rarityGemPath?: string;
  chromasJson?: string;
  chromas?: SkinChroma[];
  skinlineIdSets?: string;
  skinlineNames?: string[];
  skinlines?: Skinline[];
  universes?: Universe[];
  emblemNames?: string;
  splashVideoPath?: string;
  collectionSplashVideoPath?: string;
  collectionCardHoverVideoPath?: string;
  skinAugments?: unknown;
}

export interface SkinChroma {
  id: number;
  name: string;
  contentId?: string;
  chromaPath?: string;
  tilePath?: string;
  splashPath?: string;
  uncenteredSplashPath?: string;
  loadScreenPath?: string;
  loadScreenVintagePath?: string;
  splashVideoPath?: string;
  previewVideoUrl?: string;
  collectionSplashVideoPath?: string;
  colors?: string[];
  description?: string;
}

export interface Champion {
  id: number;
  heroId: number;
  name: string;
  nameEng?: string;
  title?: string;
  titleEng?: string;
  alias?: string;
  description?: string;
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

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
  engDescription?: string;
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
  engDescription?: string;
  skins?: Skin[];
  universe?: Universe;
}

export interface SkinlineSummary extends Skinline {
  skinCount: number;
}

export interface Universe {
  id: number;
  lolUniverseId: number;
  name: string;
  engName?: string;
  imagePath?: string;
  description?: string;
  engDescription?: string;
  lolSkinlineIdSets?: string;
  skinlines?: Skinline[];
}

export interface SkinlineDetail extends SkinlineSummary {
  skins: Skin[];
  universe?: Universe;
}

export interface UniverseSkinline extends Skinline {
  skins: Skin[];
}

export interface UniverseDetail extends Universe {
  skinlines: UniverseSkinline[];
}

export interface HomeData {
  latestSkins: Skin[];
  featuredChampions: Champion[];
  skinlines: Skinline[];
  universes: Universe[];
  prestigeChromas: PrestigeChroma[];
  dictionaries: LolDictionaries;
}

export interface HomePageData extends Omit<HomeData, "skinlines"> {
  skinlines: SkinlineSummary[];
}

export interface PrestigeChromaRelation {
  id: number;
  name: string;
  description?: string;
}

export interface PrestigeChroma {
  heroId: number;
  heroName: string;
  skinId: number;
  itemName: string;
  instanceId?: string;
  rank: number;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  cid?: string;
  cname?: string;
  timgUrl?: string;
  skinLines: PrestigeChromaRelation[];
  universes: PrestigeChromaRelation[];
}

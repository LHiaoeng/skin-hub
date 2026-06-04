import type { Champion, HomeData, Skin, Skinline, Universe } from "@/types/lol";

export const fallbackSkins: Skin[] = [
  {
    id: 1,
    riotSkinId: 103027,
    championId: 103,
    championName: "Ahri",
    name: "Spirit Blossom Ahri",
    nameEng: "Spirit Blossom Ahri",
    description: "Fallback skin data used only when the backend is unavailable.",
    rarity: "epic",
    releaseTime: "2020-08-06",
    splashPath: "https://game.gtimg.cn/images/lol/act/img/skin/big103027.jpg",
    loadScreenPath: "https://game.gtimg.cn/images/lol/act/img/skin/small103027.jpg",
    tilePath: "https://game.gtimg.cn/images/lol/act/img/skin/small103027.jpg",
    skinlineNames: ["Spirit Blossom"],
  },
  {
    id: 2,
    riotSkinId: 91018,
    championId: 910,
    championName: "Hwei",
    name: "Winterblessed Hwei",
    nameEng: "Winterblessed Hwei",
    description: "Fallback skin data used only when the backend is unavailable.",
    rarity: "epic",
    releaseTime: "2023-12-06",
    splashPath: "https://game.gtimg.cn/images/lol/act/img/skin/big_0d68fdf7-e5dc-4881-9ba4-e5625c365341.jpg",
    loadScreenPath: "https://game.gtimg.cn/images/lol/act/img/skinloading/0d68fdf7-e5dc-4881-9ba4-e5625c365341.jpg",
    tilePath: "https://game.gtimg.cn/images/lol/act/img/skin/small_0d68fdf7-e5dc-4881-9ba4-e5625c365341.jpg",
    skinlineNames: ["Winterblessed"],
  },
  {
    id: 3,
    riotSkinId: 221040,
    championId: 221,
    championName: "Zeri",
    name: "Immortal Journey Zeri",
    nameEng: "Immortal Journey Zeri",
    description: "Fallback skin data used only when the backend is unavailable.",
    rarity: "epic",
    releaseTime: "2023-08-16",
    splashPath: "https://game.gtimg.cn/images/lol/act/img/skin/big_4306d8a0-ca42-4252-a8b4-c11120b8fa79.jpg",
    loadScreenPath: "https://game.gtimg.cn/images/lol/act/img/skinloading/4306d8a0-ca42-4252-a8b4-c11120b8fa79.jpg",
    tilePath: "https://game.gtimg.cn/images/lol/act/img/skin/small_4306d8a0-ca42-4252-a8b4-c11120b8fa79.jpg",
    skinlineNames: ["Immortal Journey"],
  },
];

export const fallbackChampions: Champion[] = [
  {
    id: 1,
    heroId: 103,
    name: "Ahri",
    nameEng: "Ahri",
    title: "the Nine-Tailed Fox",
    roles: "mage,assassin",
    squarePortraitPath: "https://game.gtimg.cn/images/lol/act/img/champion/Ahri.png",
  },
  {
    id: 2,
    heroId: 22,
    name: "Ashe",
    nameEng: "Ashe",
    title: "the Frost Archer",
    roles: "marksman,support",
    squarePortraitPath: "https://game.gtimg.cn/images/lol/act/img/champion/Ashe.png",
  },
  {
    id: 3,
    heroId: 64,
    name: "Lee Sin",
    nameEng: "Lee Sin",
    title: "the Blind Monk",
    roles: "fighter,assassin",
    squarePortraitPath: "https://game.gtimg.cn/images/lol/act/img/champion/LeeSin.png",
  },
];

export const fallbackSkinlines: Skinline[] = [
  {
    id: 1,
    riotSkinlineId: 40,
    name: "Spirit Blossom",
    engName: "Spirit Blossom",
    description: "Fallback skinline data.",
  },
  {
    id: 2,
    riotSkinlineId: 52,
    name: "Winterblessed",
    engName: "Winterblessed",
    description: "Fallback skinline data.",
  },
  {
    id: 3,
    riotSkinlineId: 46,
    name: "Immortal Journey",
    engName: "Immortal Journey",
    description: "Fallback skinline data.",
  },
];

export const fallbackUniverses: Universe[] = [
  {
    id: 1,
    lolUniverseId: 12,
    name: "Spirit Blossom",
    engName: "Spirit Blossom",
    imagePath: "https://game.gtimg.cn/images/lol/act/img/skin/big103027.jpg",
    lolSkinlineIdSets: "40",
  },
  {
    id: 2,
    lolUniverseId: 18,
    name: "Runeterra Fantasy",
    engName: "Runeterra Fantasy",
    imagePath: "https://game.gtimg.cn/images/lol/act/img/skin/big_4306d8a0-ca42-4252-a8b4-c11120b8fa79.jpg",
    lolSkinlineIdSets: "46,52",
  },
];

export const fallbackHomeData: HomeData = {
  latestSkins: fallbackSkins,
  featuredChampions: fallbackChampions,
  skinlines: fallbackSkinlines,
  universes: fallbackUniverses,
  dictionaries: {
    cnRarity: [],
    globalRarity: [],
    emblems: [],
    championRoles: [],
    championPositions: [],
  },
};

import type { Champion, HomeData, LolDictionaries, Skin, SkinDictItem, Skinline, Universe } from "@/types/lol";

const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:9527";

interface PageResult<T> {
  records?: T[];
  list?: T[];
  data?: T[];
  rows?: T[];
}

interface SkinQueryParams {
  page?: number;
  size?: number;
  isPbeOnly?: number;
  keyword?: string;
  riotSkinId?: number;
  championId?: number;
  revalidate?: number;
}

interface DictData {
  dictCode?: string;
  dictItems?: SkinDictItem[];
}

const LOL_DICT_CODES = [
  "lol_skin_rarity_cn",
  "lol_skin_rarity_global",
  "lol_skin_emblem_cn",
  "lol_champion_role",
  "lol_champion_position",
] as const;

async function request<T>(path: string, revalidate: number): Promise<T | undefined> {
  try {
    const response = await fetch(`${backendBaseUrl}${path}`, {
      next: { revalidate },
    });

    if (!response.ok) {
      return undefined;
    }

    const payload: unknown = await response.json();
    return unwrapPayload<T>(payload);
  } catch {
    return undefined;
  }
}

async function requestFirst<T>(paths: string[], revalidate: number): Promise<T | undefined> {
  for (const path of paths) {
    const result = await request<T>(path, revalidate);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}

function unwrapPayload<T>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const objectPayload = payload as Record<string, unknown>;

  if ("code" in objectPayload && objectPayload.code !== 0 && objectPayload.code !== 200) {
    return undefined;
  }

  if ("data" in objectPayload) {
    return objectPayload.data as T;
  }

  return payload as T;
}

function unwrapList<T>(value: T[] | PageResult<T> | undefined): T[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return value.records ?? value.list ?? value.data ?? value.rows ?? [];
}

function isPageResult<T>(value: T | PageResult<T>): value is PageResult<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    ("records" in value || "list" in value || "rows" in value || "data" in value)
  );
}

function toSearchParams(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export async function getHomeData(): Promise<HomeData> {
  const [latestSkins, champions, skinlines, universes, dictionaries] = await Promise.all([
    getSkins({ size: 12, isPbeOnly: 1 }),
    getChampions(),
    getSkinlines(),
    getUniverses(),
    getLolDictionaries(),
  ]);

  return {
    latestSkins,
    featuredChampions: champions,
    skinlines,
    universes,
    dictionaries,
  };
}

export async function getLolDictionaries(revalidate = 3600): Promise<LolDictionaries> {
  const searchParams = new URLSearchParams();
  LOL_DICT_CODES.forEach((dictCode) => searchParams.append("dictCodes", dictCode));

  const dictList = await request<DictData[]>(`/rest/dict/data?${searchParams.toString()}`, revalidate);

  return {
    cnRarity: findDictItems(dictList, "lol_skin_rarity_cn"),
    globalRarity: findDictItems(dictList, "lol_skin_rarity_global"),
    emblems: findDictItems(dictList, "lol_skin_emblem_cn"),
    championRoles: findDictItems(dictList, "lol_champion_role"),
    championPositions: findDictItems(dictList, "lol_champion_position"),
  };
}

function findDictItems(dictList: DictData[] | undefined, dictCode: string) {
  return dictList?.find((item) => item.dictCode === dictCode)?.dictItems ?? [];
}

export async function getSkins(params: SkinQueryParams = {}): Promise<Skin[]> {
  const searchParams = toSearchParams({
    page: params.page ?? 1,
    size: params.size ?? 12,
    isPbeOnly: params.isPbeOnly,
    keyword: params.keyword,
    riotSkinId: params.riotSkinId,
    championId: params.championId,
  });

  const result = await requestFirst<Skin[] | PageResult<Skin>>(
    [`/rest/lol/skins?${searchParams}`, `/lol/skin/page?${searchParams}`],
    params.revalidate ?? 3600,
  );

  return unwrapList(result);
}

export async function getSkin(riotSkinId: number): Promise<Skin | undefined> {
  const result = await requestFirst<Skin | Skin[] | PageResult<Skin>>(
    [
      `/rest/lol/skins/${riotSkinId}`,
      `/rest/lol/skins?${toSearchParams({ riotSkinId, page: 1, size: 1 })}`,
      `/lol/skin/page?${toSearchParams({ riotSkinId, page: 1, size: 1 })}`,
    ],
    86400,
  );

  if (!result) {
    return undefined;
  }

  if (Array.isArray(result)) {
    return result[0];
  }

  if (isPageResult(result)) {
    return unwrapList(result)[0];
  }

  return result;
}

export async function getChampions(): Promise<Champion[]> {
  const result = await requestFirst<Champion[] | PageResult<Champion>>(
    ["/rest/lol/champions", "/lol/champion/page?page=1&size=500"],
    3600,
  );

  return unwrapList(result);
}

export async function getChampion(heroId: number): Promise<Champion | undefined> {
  const detail = await requestFirst<Champion>([`/rest/lol/champions/${heroId}`], 86400);
  if (detail) {
    return detail;
  }

  const champions = await getChampions();
  return champions.find((champion) => champion.heroId === heroId);
}

export async function getChampionSkins(championId: number, revalidate = 3600): Promise<Skin[]> {
  return getSkins({
    championId,
    size: 100,
    revalidate,
  });
}

export async function getSkinlines(): Promise<Skinline[]> {
  const result = await requestFirst<Skinline[] | PageResult<Skinline>>(
    ["/rest/lol/skinlines?page=1&size=200", "/lol/skinline/page?page=1&size=200"],
    86400,
  );

  return unwrapList(result);
}

export async function getUniverses(): Promise<Universe[]> {
  const result = await requestFirst<Universe[] | PageResult<Universe>>(
    ["/rest/lol/universes?page=1&size=200", "/lol/universe/page?page=1&size=200"],
    86400,
  );

  return unwrapList(result);
}

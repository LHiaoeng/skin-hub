import type { PrestigeChroma, PrestigeChromaRelation } from "@/types/lol";

const IMAGE_BASE_URL =
  "https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin";
const PRESTIGE_CHROMA_PATH = "/rest/lol/prestige-chromas";
const PRESTIGE_CHROMA_REVALIDATE = 86400;
const ROUTE_SLUG_PATTERN = /[^a-z0-9]+/g;
const ALL_GROUP_LABEL = "所有";
const UNKNOWN_UNIVERSE_LABEL = "未归属宇宙";
const UNKNOWN_SKINLINE_LABEL = "未归属套装";

export const PRESTIGE_CHROMA_CATEGORY_ORDER: readonly string[] = [];

interface FetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (
  url: string,
  init: { next: { revalidate: number } },
) => Promise<FetchResponse>;

export type PrestigeChromaGroupKey =
  | "all"
  | "champion"
  | "universe"
  | "skinline";
export type PrestigeChromaSortKey = "rank" | "count";
export type PrestigeChromaSortOrder = "asc" | "desc";

export interface PrestigeChromaListOptions {
  groupBy: PrestigeChromaGroupKey;
  sortBy: PrestigeChromaSortKey;
  order: PrestigeChromaSortOrder;
  categoryId?: string;
}

export interface PrestigeChromaCardGroup {
  key: string;
  label: string;
  href?: string;
  items: PrestigeChroma[];
}

export interface PrestigeChromaCategoryOption {
  id: string;
  label: string;
  count: number;
  iconUrl?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(
      `Invalid prestige chroma ${field}: expected a finite number`,
    );
  }

  return value;
}

function requirePositiveInteger(value: unknown, field: string): number {
  const parsed = requireNumber(value, field);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid prestige chroma ${field}: expected a positive integer`,
    );
  }

  return parsed;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Invalid prestige chroma ${field}: expected a non-empty string`,
    );
  }

  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`Invalid prestige chroma ${field}: expected a string`);
  }

  return value;
}

function parseRelations(
  value: unknown,
  field: string,
): PrestigeChromaRelation[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`Invalid prestige chroma ${field}: expected an array`);
  }

  return value.map((relation, index) => {
    if (!isRecord(relation)) {
      throw new Error(
        `Invalid prestige chroma ${field}[${index}]: expected an object`,
      );
    }

    const id = requireNumber(relation.id, `${field}[${index}].id`);
    const name = requireString(relation.name, `${field}[${index}].name`);
    const description = optionalString(
      relation.description,
      `${field}[${index}].description`,
    );

    return description === undefined ? { id, name } : { id, name, description };
  });
}

function parseItem(value: unknown, index: number): PrestigeChroma {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid prestige chroma record at index ${index}: expected an object`,
    );
  }

  const skinId = requirePositiveInteger(value.skinId, `record ${index} skinId`);
  const itemName = requireString(value.itemName, `record ${index} itemName`);
  const heroId = requireNumber(value.heroId, `record ${index} heroId`);
  const heroName = requireString(value.heroName, `record ${index} heroName`);
  const rank = requireNumber(value.rank, `record ${index} rank`);
  const skinLines = parseRelations(
    value.skinLines,
    `record ${index} skinLines`,
  );
  const universes = parseRelations(
    value.universes,
    `record ${index} universes`,
  );
  const instanceId = optionalString(
    value.instanceId,
    `record ${index} instanceId`,
  );

  if (instanceId?.trim() && !/^[A-Za-z0-9_-]+$/.test(instanceId)) {
    throw new Error(
      `Invalid prestige chroma record ${index} instanceId: expected letters, numbers, hyphens, or underscores`,
    );
  }

  const item: PrestigeChroma = {
    heroId,
    heroName,
    skinId,
    itemName,
    rank,
    skinLines,
    universes,
  };
  const startTime = optionalString(
    value.startTime,
    `record ${index} startTime`,
  );
  const endTime = optionalString(value.endTime, `record ${index} endTime`);
  const startDate = optionalString(
    value.startDate,
    `record ${index} startDate`,
  );
  const cid = optionalString(value.cid, `record ${index} cid`);
  const cname = optionalString(value.cname, `record ${index} cname`);
  const timgUrl = optionalString(value.timgUrl, `record ${index} timgUrl`);

  if (instanceId !== undefined) item.instanceId = instanceId;
  if (startTime !== undefined) item.startTime = startTime;
  if (endTime !== undefined) item.endTime = endTime;
  if (startDate !== undefined) item.startDate = startDate;
  if (cid !== undefined) item.cid = cid;
  if (cname !== undefined) item.cname = cname;
  if (timgUrl !== undefined) item.timgUrl = timgUrl;

  return item;
}

export function parsePrestigeChromaList(payload: unknown): PrestigeChroma[] {
  let data: unknown;

  if (Array.isArray(payload)) {
    data = payload;
  } else if (isRecord(payload) && "code" in payload) {
    if (payload.code !== 0 && payload.code !== 200) {
      throw new Error(
        `Prestige chroma API returned failure code ${String(payload.code)}`,
      );
    }
    data = payload.data;
    if (!Array.isArray(data)) {
      throw new Error("Prestige chroma API data must be an array");
    }
  } else {
    throw new Error(
      "Prestige chroma payload must be an array or a successful API response",
    );
  }

  if (!Array.isArray(data)) {
    throw new Error("Prestige chroma payload data must be an array");
  }

  return data.map(parseItem);
}

export async function fetchPrestigeChromas(
  fetcher: Fetcher,
  backendBaseUrl: string,
): Promise<PrestigeChroma[]> {
  let response: FetchResponse;

  try {
    response = await fetcher(`${backendBaseUrl}${PRESTIGE_CHROMA_PATH}`, {
      next: { revalidate: PRESTIGE_CHROMA_REVALIDATE },
    });
  } catch (error) {
    throw new Error(
      `[backend-client] ${PRESTIGE_CHROMA_PATH} network request failed.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new Error(
      `[backend-client] ${PRESTIGE_CHROMA_PATH} returned HTTP ${response.status}.`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(
      `[backend-client] ${PRESTIGE_CHROMA_PATH} returned invalid JSON.`,
      { cause: error },
    );
  }

  return parsePrestigeChromaList(payload);
}

export function resolvePrestigeChroma(
  items: readonly PrestigeChroma[],
  skinId: number,
): PrestigeChroma | undefined {
  const matches = items.filter((item) => item.skinId === skinId);
  if (matches.length > 1) {
    throw new Error(`Duplicate prestige chroma skinId ${skinId}`);
  }

  return matches[0];
}

export function sortPrestigeChromas(
  items: readonly PrestigeChroma[],
): PrestigeChroma[] {
  return [...items].sort(
    (left, right) => left.rank - right.rank || left.skinId - right.skinId,
  );
}

export function sortPrestigeChromasByRank(
  items: readonly PrestigeChroma[],
  order: PrestigeChromaSortOrder,
): PrestigeChroma[] {
  const direction = order === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    const rankComparison = (left.rank - right.rank) * direction;
    return rankComparison !== 0 ? rankComparison : left.skinId - right.skinId;
  });
}

export function getPrestigeChromaImageUrl(
  item: PrestigeChroma,
): string | undefined {
  const instanceId = item.instanceId?.trim();
  return instanceId ? `${IMAGE_BASE_URL}/site3-${instanceId}.jpg` : undefined;
}

export function getPrestigeChromaCardImageUrl(
  item: PrestigeChroma,
): string | undefined {
  const instanceId = item.instanceId?.trim();
  return instanceId ? `${IMAGE_BASE_URL}/site5-${instanceId}.jpg` : undefined;
}

export function getPrestigeChromaTagImageUrl(
  item: PrestigeChroma,
): string | undefined {
  const tagImageUrl = item.timgUrl?.trim();
  return tagImageUrl || undefined;
}

export function getPrestigeChromaCardTitle(item: PrestigeChroma): string {
  return item.itemName;
}

export function parsePrestigeChromaListOptions(searchParams?: {
  group?: string | string[];
  sort?: string | string[];
  order?: string | string[];
  category?: string | string[];
}): PrestigeChromaListOptions {
  const group = firstValue(searchParams?.group);
  const sort = firstValue(searchParams?.sort);
  const order = firstValue(searchParams?.order);
  const category = firstValue(searchParams?.category)?.trim();
  const groupBy = isPrestigeChromaGroupKey(group) ? group : "all";

  const options: PrestigeChromaListOptions = {
    groupBy,
    sortBy: groupBy !== "all" && sort === "count" ? "count" : "rank",
    order: order === "asc" ? "asc" : "desc",
  };

  if (category) {
    options.categoryId = category;
  }

  return options;
}

export function getPrestigeChromaCategoryOptions(
  items: readonly PrestigeChroma[],
): PrestigeChromaCategoryOption[] {
  const categories = new Map<string, PrestigeChromaCategoryOption>();

  for (const item of items) {
    const id = item.cid?.trim();
    const label = item.cname?.trim();
    if (!id || !label) continue;

    const existing = categories.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      const iconUrl = item.timgUrl?.trim();
      categories.set(
        id,
        iconUrl ? { id, label, count: 1, iconUrl } : { id, label, count: 1 },
      );
    }
  }

  return [...categories.values()].sort((left, right) => {
    const categoryComparison = compareConfiguredCategoryOrder(
      `category:${left.id}`,
      `category:${right.id}`,
    );
    if (categoryComparison !== 0) return categoryComparison;

    const nameComparison = left.label.localeCompare(right.label, "zh-CN");
    return nameComparison !== 0
      ? nameComparison
      : left.id.localeCompare(right.id, "zh-CN");
  });
}

export function filterPrestigeChromasForList(
  items: readonly PrestigeChroma[],
  options: PrestigeChromaListOptions,
): PrestigeChroma[] {
  const categoryId = options.categoryId?.trim();
  if (!categoryId) return [...items];

  return items.filter((item) => item.cid?.trim() === categoryId);
}

export function getPrestigeChromaCardGroups(
  items: readonly PrestigeChroma[],
  options: PrestigeChromaListOptions,
): PrestigeChromaCardGroup[] {
  const groups = new Map<string, PrestigeChromaCardGroup>();
  const listItems = filterPrestigeChromasForList(items, options);

  if (options.groupBy === "all") {
    return [
      {
        key: "all",
        label: ALL_GROUP_LABEL,
        items: sortPrestigeChromasByRank(listItems, options.order),
      },
    ];
  }

  for (const item of sortPrestigeChromasByRank(listItems, options.order)) {
    for (const group of getItemGroups(item, options.groupBy)) {
      const existingGroup = groups.get(group.key);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groups.set(group.key, { ...group, items: [item] });
      }
    }
  }

  const sortedGroups = [...groups.values()].map((group) => ({
    ...group,
    items: sortPrestigeChromasByRank(group.items, options.order),
  }));

  return sortedGroups.sort((left, right) =>
    compareGroups(left, right, options),
  );
}

export function getPrestigeChromaNavigation(
  items: readonly PrestigeChroma[],
  currentItem: PrestigeChroma,
): {
  previousItem: PrestigeChroma | undefined;
  nextItem: PrestigeChroma | undefined;
} {
  const sortedItems = sortPrestigeChromas(items);
  const currentIndex = sortedItems.findIndex(
    (item) =>
      item.skinId === currentItem.skinId &&
      getPrestigeChromaRouteKey(item) ===
        getPrestigeChromaRouteKey(currentItem),
  );

  return {
    previousItem: currentIndex > 0 ? sortedItems[currentIndex - 1] : undefined,
    nextItem:
      currentIndex >= 0 && currentIndex < sortedItems.length - 1
        ? sortedItems[currentIndex + 1]
        : undefined,
  };
}

function getPrestigeChromaRouteKey(item: PrestigeChroma): string {
  return `${item.skinId}:${item.itemName.normalize("NFC").trim().toLowerCase()}`;
}

export function buildPrestigeChromaDescription(item: PrestigeChroma): string {
  const parts = [item.itemName.trim()];
  const heroName = item.heroName.trim();
  const cname = item.cname?.trim();
  const skinlineNames = item.skinLines
    .map(({ name }) => name.trim())
    .filter(Boolean);
  const universeNames = item.universes
    .map(({ name }) => name.trim())
    .filter(Boolean);
  const releaseTime = getReleaseTime(item);

  if (heroName) parts.push(heroName);
  if (cname) parts.push(cname);
  if (skinlineNames.length > 0) parts.push(`系列：${skinlineNames.join("、")}`);
  if (universeNames.length > 0) parts.push(`宇宙：${universeNames.join("、")}`);
  if (releaseTime) parts.push(releaseTime);

  return parts.join(" · ");
}

function getItemGroups(
  item: PrestigeChroma,
  groupBy: PrestigeChromaGroupKey,
): Array<{ key: string; label: string; href?: string }> {
  if (groupBy === "universe") {
    return relationGroups(
      item.universes,
      "__unknown_universe",
      UNKNOWN_UNIVERSE_LABEL,
      (relation) => `/universes/${relation.id}-${toRouteSlug(relation.name)}`,
    );
  }

  if (groupBy === "skinline") {
    return relationGroups(
      item.skinLines,
      "__unknown_skinline",
      UNKNOWN_SKINLINE_LABEL,
      (relation) => `/skinlines/${relation.id}-${toRouteSlug(relation.name)}`,
    );
  }

  const label = item.heroName.trim() || String(item.heroId);
  return [
    {
      key: `champion:${item.heroId}`,
      label,
      href: `/champions/${item.heroId}-${toRouteSlug(label)}`,
    },
  ];
}

function relationGroups(
  relations: PrestigeChromaRelation[],
  unknownKey: string,
  unknownLabel: string,
  hrefForRelation: (relation: PrestigeChromaRelation) => string,
): Array<{ key: string; label: string; href?: string }> {
  if (relations.length === 0) {
    return [{ key: unknownKey, label: unknownLabel }];
  }

  return relations.map((relation) => ({
    key: String(relation.id),
    label: relation.name,
    href: hrefForRelation(relation),
  }));
}

function compareGroups(
  left: PrestigeChromaCardGroup,
  right: PrestigeChromaCardGroup,
  options: PrestigeChromaListOptions,
) {
  const leftUnknown = left.key.startsWith("__unknown_");
  const rightUnknown = right.key.startsWith("__unknown_");
  if (leftUnknown || rightUnknown) {
    if (leftUnknown && rightUnknown) return 0;
    return leftUnknown ? 1 : -1;
  }

  if (options.sortBy === "count") {
    const direction = options.order === "asc" ? 1 : -1;
    const countComparison =
      (left.items.length - right.items.length) * direction;
    if (countComparison !== 0) return countComparison;
  }

  if (options.sortBy === "rank") {
    const direction = options.order === "asc" ? 1 : -1;
    const leftRank = left.items[0]?.rank ?? 0;
    const rightRank = right.items[0]?.rank ?? 0;
    const rankComparison = (leftRank - rightRank) * direction;
    if (rankComparison !== 0) return rankComparison;
  }

  return left.label.localeCompare(right.label, "zh-CN");
}

function getReleaseTime(item: PrestigeChroma): string | undefined {
  return item.startDate?.trim() || item.startTime?.trim() || undefined;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toRouteSlug(value: string | number | undefined): string {
  if (value === undefined) {
    return "unknown";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(ROUTE_SLUG_PATTERN, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "unknown";
}

function isPrestigeChromaGroupKey(
  value: string | undefined,
): value is PrestigeChromaGroupKey {
  return (
    value === "all" ||
    value === "champion" ||
    value === "universe" ||
    value === "skinline"
  );
}

function compareConfiguredCategoryOrder(leftKey: string, rightKey: string) {
  const leftCategoryId = leftKey.startsWith("category:")
    ? leftKey.slice("category:".length)
    : leftKey;
  const rightCategoryId = rightKey.startsWith("category:")
    ? rightKey.slice("category:".length)
    : rightKey;
  const leftIndex = PRESTIGE_CHROMA_CATEGORY_ORDER.indexOf(leftCategoryId);
  const rightIndex = PRESTIGE_CHROMA_CATEGORY_ORDER.indexOf(rightCategoryId);
  const leftConfigured = leftIndex >= 0;
  const rightConfigured = rightIndex >= 0;

  if (leftConfigured || rightConfigured) {
    if (leftConfigured && rightConfigured) return leftIndex - rightIndex;
    return leftConfigured ? -1 : 1;
  }

  return 0;
}

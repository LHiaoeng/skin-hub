import type { PrestigeChroma } from "@/types/lol";

const slugPattern = /[^a-z0-9]+/g;
const unicodeSlugPattern = /[^\p{L}\p{N}]+/gu;

export function toSlug(value: string | number | undefined): string {
  if (value === undefined) {
    return "unknown";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(slugPattern, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "unknown";
}

export function prestigeChromaPath(item: {
  skinId: number;
  itemName: string;
}): string {
  const slug = item.itemName
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(unicodeSlugPattern, "-")
    .replace(/^-+|-+$/g, "");

  return `/prestige-chromas/${item.skinId}-${slug || "unknown"}`;
}

export interface PrestigeChromaRouteResolution {
  item: PrestigeChroma;
  canonicalPath: string;
  shouldRedirect: boolean;
}

export function resolvePrestigeChromaRoute(
  items: readonly PrestigeChroma[],
  segment: string,
): PrestigeChromaRouteResolution | undefined {
  let decodedSegment: string;
  try {
    decodedSegment = decodeURIComponent(segment);
  } catch {
    return undefined;
  }

  const [rawSkinId] = decodedSegment.split("-");
  const skinId = Number(rawSkinId);
  if (!Number.isInteger(skinId) || skinId <= 0) {
    return undefined;
  }

  const matches = items.filter((item) => item.skinId === skinId);
  if (matches.length > 1) {
    throw new Error(`Duplicate prestige chroma skinId ${skinId}`);
  }
  const item = matches[0];
  if (!item) {
    return undefined;
  }

  return {
    item,
    canonicalPath: prestigeChromaPath(item),
    shouldRedirect: decodedSegment !== prestigeChromaSegment(item),
  };
}

export function buildPrestigeChromaSeo(
  item: PrestigeChroma,
  description: string,
  imageUrl: string | undefined,
) {
  return {
    title: `${item.itemName}臻彩皮肤与资料`,
    description,
    canonicalPath: prestigeChromaPath(item),
    imageUrl,
    imageAlt: `${item.itemName}臻彩皮肤`,
  };
}

function prestigeChromaSegment(item: {
  skinId: number;
  itemName: string;
}): string {
  return prestigeChromaPath(item).slice("/prestige-chromas/".length);
}

export function skinPath(skin: {
  riotSkinId: number;
  nameEng?: string;
  name: string;
}): string {
  return `/skins/${skin.riotSkinId}-${toSlug(skin.nameEng ?? skin.name)}`;
}

export function championPath(champion: {
  heroId: number;
  nameEng?: string;
  name: string;
}): string {
  return `/champions/${champion.heroId}-${toSlug(champion.nameEng ?? champion.name)}`;
}

export function skinlinePath(skinline: {
  riotSkinlineId: number;
  engName?: string;
  name: string;
}): string {
  return `/skinlines/${skinline.riotSkinlineId}-${toSlug(skinline.engName ?? skinline.name)}`;
}

export function universePath(universe: {
  lolUniverseId: number;
  engName?: string;
  name: string;
}): string {
  return `/universes/${universe.lolUniverseId}-${toSlug(universe.engName ?? universe.name)}`;
}

export function parseRouteId(value: string): number {
  const [id] = value.split("-");
  return Number(id);
}

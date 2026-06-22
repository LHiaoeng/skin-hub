import type { Skin } from "@/types/lol";

export type SkinSortField = "release" | "rarity";
export type SkinSortOrder = "asc" | "desc";
export interface SkinSort {
  field: SkinSortField;
  order: SkinSortOrder;
}

export function parseSkinSort(searchParams: { sort?: string | string[]; order?: string | string[] } | undefined): SkinSort {
  const field = firstValue(searchParams?.sort) === "rarity" ? "rarity" : "release";
  const order = firstValue(searchParams?.order) === "desc" ? "desc" : "asc";
  return { field, order };
}

export function sortSkins(skins: Skin[], sort: SkinSort): Skin[] {
  const direction = sort.order === "asc" ? 1 : -1;

  return [...skins].sort((left, right) => {
    if (sort.field === "rarity") {
      return (rarityValue(left) - rarityValue(right) || left.riotSkinId - right.riotSkinId) * direction;
    }

    const leftTime = Date.parse(left.releaseTime ?? "") || left.riotSkinId;
    const rightTime = Date.parse(right.releaseTime ?? "") || right.riotSkinId;
    return (leftTime - rightTime || left.riotSkinId - right.riotSkinId) * direction;
  });
}

export function nextSkinSortOrder(field: SkinSortField, activeSort: SkinSort): SkinSortOrder {
  if (activeSort.field === field) {
    return activeSort.order === "asc" ? "desc" : "asc";
  }

  return field === "rarity" ? "desc" : "asc";
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function rarityValue(skin: Skin): number {
  const numericRarity = Number(skin.rarity);
  return Number.isFinite(numericRarity) ? numericRarity : Number(skin.regionRarityId ?? 0);
}

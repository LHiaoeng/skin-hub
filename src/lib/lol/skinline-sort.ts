import type { SkinlineSummary } from "@/types/lol";

export type SkinlineSortKey = "name" | "count";
export type SortOrder = "asc" | "desc";

export interface SkinlineSort {
  key: SkinlineSortKey;
  order: SortOrder;
}

export function parseSkinlineSort(searchParams?: {
  sort?: string | string[];
  order?: string | string[];
}): SkinlineSort {
  const sort = firstValue(searchParams?.sort);
  const order = firstValue(searchParams?.order);
  return {
    key: sort === "count" ? "count" : "name",
    order: order === "desc" ? "desc" : "asc",
  };
}

export function sortSkinlines(skinlines: SkinlineSummary[], sort: SkinlineSort): SkinlineSummary[] {
  const direction = sort.order === "asc" ? 1 : -1;
  return [...skinlines].sort((left, right) => {
    if (sort.key === "count") {
      const countComparison = (left.skinCount - right.skinCount) * direction;
      if (countComparison !== 0) return countComparison;

      const nameComparison = compareName(left.name, right.name);
      if (nameComparison !== 0) return nameComparison;
      return left.riotSkinlineId - right.riotSkinlineId;
    }

    const nameComparison = compareName(left.name, right.name) * direction;
    return nameComparison !== 0 ? nameComparison : left.riotSkinlineId - right.riotSkinlineId;
  });
}

function compareName(left: string, right: string) {
  return left.localeCompare(right, "zh-CN");
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

import { normalizeImageUrl } from "@/lib/images/cdn";
import type {
  SkinDictDisplayItem,
  SkinDictItem,
  SkinDictValue,
} from "@/types/lol";

export type {
  SkinDictDisplayItem,
  SkinDictItem,
  SkinDictValue,
} from "@/types/lol";

const RARITY_GEM_BASE_PATH =
  "plugins/rcp-be-lol-game-data/global/default/v1/rarity-gem-icons";

const CN_RARITY_NAMES: Record<string, string> = {
  "0": "其他",
  "1": "典藏",
  "2": "勇士",
  "3": "王者",
  "4": "史诗",
  "5": "传说",
  "6": "Unknown-6",
  "7": "限定",
  "8": "神话",
  "9": "终极",
  "10": "圣堂",
  "11": "卓越",
};

const GLOBAL_RARITY_NAMES: Record<string, string> = {
  kepic: "Epic",
  kexalted: "Exalted",
  klegendary: "Legendary",
  kmythic: "Mythic",
  knorarity: "NoRarity",
  krare: "Rare",
  ktranscendent: "Transcendent",
  kultimate: "Ultimate",
};

const GLOBAL_RARITY_ICON_NAMES = new Set([
  "epic",
  "exalted",
  "legendary",
  "mythic",
  "transcendent",
  "ultimate",
]);

function toKey(value: SkinDictValue | null | undefined) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function toComparableKey(value: SkinDictValue | null | undefined) {
  return toKey(value).toLowerCase();
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim());
}

function fileNameOf(path: string) {
  return path.split(/[\\/]/).pop()?.toLowerCase() ?? "";
}

function normalizeEmblemValues(values?: string | string[] | null) {
  if (Array.isArray(values)) {
    return values.map((item) => item.trim()).filter(Boolean);
  }

  return (
    values
      ?.split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

function getDictItemName(item: SkinDictItem | undefined, fallback: string) {
  return item?.name?.trim() || item?.label?.trim() || fallback;
}

export function findSkinDictItem(
  items: SkinDictItem[] | undefined,
  value: SkinDictValue | null | undefined,
) {
  const key = toComparableKey(value);
  if (!items?.length || !key) {
    return undefined;
  }

  return items.find((item) => toComparableKey(item.value) === key);
}

export function getCnRarityName(
  regionRarityId: SkinDictValue | null | undefined,
  dictItems?: SkinDictItem[],
) {
  const key = toKey(regionRarityId);
  if (!key) {
    return "国服稀有度";
  }

  return getDictItemName(
    findSkinDictItem(dictItems, key),
    CN_RARITY_NAMES[key] ?? key,
  );
}

export function getCnRarityIconPath(
  regionRarityId: SkinDictValue | null | undefined,
  rarityGemPath?: string,
  dictItems?: SkinDictItem[],
) {
  const rarityId = toKey(regionRarityId);

  if (rarityId === "0") {
    return undefined;
  }

  const dictIconPath = getCnRarityIconPathFromDict(dictItems, rarityId);

  if (dictIconPath) {
    return dictIconPath;
  }

  if (rarityId) {
    return `${RARITY_GEM_BASE_PATH}/cn-gem-${rarityId}.png`;
  }

  return asString(rarityGemPath);
}

export function getCnRarityIconUrl(
  regionRarityId: SkinDictValue | null | undefined,
  rarityGemPath?: string,
  isPbeOnly?: number | boolean,
  dictItems?: SkinDictItem[],
) {
  return normalizeImageUrl(
    getCnRarityIconPath(regionRarityId, rarityGemPath, dictItems),
    isPbeOnly,
  );
}

export function getCnRarityIconPathFromDict(
  dictItems: SkinDictItem[] | undefined,
  regionRarityId: SkinDictValue,
) {
  const rarityId = toKey(regionRarityId);
  const item = findSkinDictItem(dictItems, rarityId);
  const paths = asStringArray(item?.attributes?.gemIconUrls);

  if (!paths.length) {
    return undefined;
  }

  if (rarityId === "0") {
    return undefined;
  }

  const preferredFileName = `cn-gem-${rarityId}.png`;
  return (
    paths.find((path) => fileNameOf(path) === preferredFileName) ?? paths[0]
  );
}

export function getGlobalRarityName(
  rarity: SkinDictValue | null | undefined,
  dictItems?: SkinDictItem[],
) {
  const key = toKey(rarity);
  if (!key) {
    return "直营服稀有度";
  }

  return getDictItemName(
    findSkinDictItem(dictItems, key),
    GLOBAL_RARITY_NAMES[key.toLowerCase()] ?? key,
  );
}

export function getGlobalRarityIconPath(
  rarity: SkinDictValue | null | undefined,
  dictItems?: SkinDictItem[],
) {
  const dictIconPath = getGlobalRarityIconPathFromDict(dictItems, rarity);
  if (dictIconPath) {
    return dictIconPath;
  }

  const iconName = toKey(rarity).replace(/^k/i, "").toLowerCase();
  if (!GLOBAL_RARITY_ICON_NAMES.has(iconName)) {
    return undefined;
  }

  return `${RARITY_GEM_BASE_PATH}/${iconName}.png`;
}

export function getGlobalRarityIconUrl(
  rarity: SkinDictValue | null | undefined,
  isPbeOnly?: number | boolean,
  dictItems?: SkinDictItem[],
) {
  return normalizeImageUrl(
    getGlobalRarityIconPath(rarity, dictItems),
    isPbeOnly,
  );
}

export function getGlobalRarityIconPathFromDict(
  dictItems: SkinDictItem[] | undefined,
  rarity: SkinDictValue | null | undefined,
) {
  const item = findSkinDictItem(dictItems, rarity);
  const iconUrls = asStringArray(item?.attributes?.gemIconUrls);

  if (iconUrls.length) {
    return iconUrls[0];
  }

  return (
    asString(item?.attributes?.iconUrl) ??
    asString(item?.attributes?.large) ??
    asString(item?.attributes?.small)
  );
}

export function getEmblemDisplayItems(
  dictItems: SkinDictItem[] | undefined,
  emblemNames?: string | string[] | null,
  isPbeOnly?: number | boolean,
): SkinDictDisplayItem[] {
  return normalizeEmblemValues(emblemNames).map((value) => {
    const item = findSkinDictItem(dictItems, value);
    const iconPath = getEmblemIconPath(item);

    return {
      value,
      name: getDictItemName(item, value),
      iconPath,
      iconUrl: normalizeImageUrl(iconPath, isPbeOnly, "zh_cn"),
    };
  });
}

export function getEmblemIconPath(item: SkinDictItem | undefined) {
  return asString(item?.attributes?.small) ?? asString(item?.attributes?.large);
}

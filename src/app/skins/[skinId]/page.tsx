import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import {
  getChampion,
  getChampionSkins,
  getLolDictionaries,
  getSkin,
  getSkinlines,
  getSkins,
  getUniverses,
} from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import {
  getCnRarityIconUrl,
  getCnRarityName,
  getEmblemDisplayItems,
  getGlobalRarityIconUrl,
  getGlobalRarityName,
} from "@/lib/lol/rarity";
import {
  championPath,
  parseRouteId,
  skinlinePath,
  skinPath,
  universePath,
} from "@/lib/routing/slug";
import { breadcrumbSchema, skinImageSchema } from "@/lib/seo/schema";
import type {
  Champion,
  Skin,
  SkinChroma,
  SkinDictItem,
  Skinline,
  Universe,
} from "@/types/lol";

import {
  SkinDetailViewer,
  type SkinDetailViewerProps,
  type SkinVisual,
} from "./skin-detail-viewer";

interface SkinDetailPageProps {
  params: Promise<{
    skinId: string;
  }>;
}

type UnknownRecord = Record<string, unknown>;

export const revalidate = 86400;

export async function generateStaticParams() {
  const skins = await getSkins({ size: 24 });
  return skins.map((skin) => ({
    skinId: skinPath(skin).replace("/skins/", ""),
  }));
}

export async function generateMetadata({
  params,
}: SkinDetailPageProps): Promise<Metadata> {
  const { skinId } = await params;
  const skin = await getSkin(parseRouteId(skinId));

  if (!skin) {
    return {
      title: "皮肤未找到",
    };
  }

  const imageUrl = normalizeImageUrl(
    skin.uncenteredSplashPath ?? skin.splashPath ?? skin.loadScreenPath,
    skin.isPbeOnly,
  );
  const description =
    skin.description ??
    `${skin.name} 的皮肤原画、英雄、稀有度、系列和上线时间。`;

  return {
    title: `${skin.name} 皮肤详情`,
    description,
    alternates: {
      canonical: skinPath(skin),
    },
    openGraph: {
      title: `${skin.name} 皮肤详情`,
      description,
      images: imageUrl
        ? [{ url: imageUrl, alt: `${skin.name} 皮肤原画` }]
        : undefined,
    },
  };
}

export default async function SkinDetailPage({ params }: SkinDetailPageProps) {
  const { skinId } = await params;
  const skin = await getSkin(parseRouteId(skinId));

  if (!skin) {
    notFound();
  }

  const [champion, championSkins, dictionaries, allSkinlines, allUniverses] =
    await Promise.all([
      getChampion(skin.championId),
      getChampionSkins(skin.championId, revalidate),
      getLolDictionaries(revalidate),
      getSkinlines(),
      getUniverses(),
    ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${siteUrl}${skinPath(skin)}`;
  const splashUrl = normalizeImageUrl(
    skin.uncenteredSplashPath ?? skin.splashPath ?? skin.loadScreenPath,
    skin.isPbeOnly,
  );
  const viewerProps = buildViewerProps({
    skin,
    champion,
    championSkins,
    allSkinlines,
    allUniverses,
    cnRarityItems: dictionaries.cnRarity,
    globalRarityItems: dictionaries.globalRarity,
    emblemItems: dictionaries.emblems,
  });

  return (
    <>
      <JsonLd data={skinImageSchema(skin, splashUrl, pageUrl)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: siteUrl },
          { name: "皮肤", url: `${siteUrl}/skins` },
          { name: skin.name, url: pageUrl },
        ])}
      />
      <SkinDetailViewer {...viewerProps} />
    </>
  );
}

function buildViewerProps({
  skin,
  champion,
  championSkins,
  allSkinlines,
  allUniverses,
  cnRarityItems,
  globalRarityItems,
  emblemItems,
}: {
  skin: Skin;
  champion?: Champion;
  championSkins: Skin[];
  allSkinlines: Skinline[];
  allUniverses: Universe[];
  cnRarityItems: SkinDictItem[];
  globalRarityItems: SkinDictItem[];
  emblemItems: SkinDictItem[];
}): SkinDetailViewerProps {
  const championName = getChampionDisplayName(champion, skin);
  const sortedChampionSkins = sortSkinsByRelease(championSkins);
  const currentIndex = sortedChampionSkins.findIndex(
    (item) => item.riotSkinId === skin.riotSkinId,
  );
  const prevSkin =
    currentIndex > 0 ? sortedChampionSkins[currentIndex - 1] : undefined;
  const nextSkin =
    currentIndex >= 0 && currentIndex < sortedChampionSkins.length - 1
      ? sortedChampionSkins[currentIndex + 1]
      : undefined;
  const skinlines = resolveSkinlines(skin, allSkinlines);
  const universes = resolveUniverses(skin, skinlines, allUniverses);
  const rarityName = getCnRarityName(skin.regionRarityId, cnRarityItems);
  const globalRarityName = getGlobalRarityName(skin.rarity, globalRarityItems);
  const rarityIconUrl = getCnRarityIconUrl(
    skin.regionRarityId,
    skin.rarityGemPath,
    skin.isPbeOnly,
    cnRarityItems,
  );
  const globalRarityIconUrl = getGlobalRarityIconUrl(
    skin.rarity,
    skin.isPbeOnly,
    globalRarityItems,
  );
  const emblems = getEmblemDisplayItems(
    emblemItems,
    skin.emblemNames,
    skin.isPbeOnly,
  );
  const emblemNames = emblems.map((item) => item.name);
  const chromas = parseSkinChromas(skin);

  return {
    skinName: skin.name,
    description:
      skin.description ??
      `${skin.name} 的 LOL 皮肤详情，包含原画、稀有度、系列和上线时间。`,
    championName,
    championHref: champion ? championPath(champion) : undefined,
    rarityName,
    globalRarityName,
    rarityIconUrl,
    tags: [
      skin.isLegacy ? "限定" : "",
      skin.isPbeOnly ? "PBE" : "",
      skin.releaseTime ? `上线：${skin.releaseTime}` : "",
      ...emblemNames,
    ].filter(Boolean),
    cnDetails: [
      { label: "皮肤 ID", value: String(skin.riotSkinId) },
      { label: "英雄", value: championName },
      { label: "英雄 ID", value: String(skin.championId) },
      { label: "是否正式上线", value: skin.isPbeOnly ? "否" : "是" },
      ...(skin.releaseTime
        ? [{ label: "上线时间", value: skin.releaseTime }]
        : []),
      {
        label: "国服皮肤品质",
        icons: rarityIconUrl
          ? [
              {
                name: rarityName,
                iconUrl: rarityIconUrl,
              },
            ]
          : [],
      },
      {
        label: "徽章",
        icons: emblems.map((item) => ({
          name: item.name,
          iconUrl: item.iconUrl,
          popoverIconUrl: item.iconUrl,
        })),
      },
    ],
    globalDetails: [
      { label: "英文名", value: skin.nameEng ?? "未提供" },
      {
        label: "直营服皮肤品质",
        icons: globalRarityIconUrl
          ? [{ name: globalRarityName, iconUrl: globalRarityIconUrl }]
          : [],
      },
    ],
    skinlines: skinlines.map((item) => ({
      label: item.name,
      href: skinlinePath(item),
      meta: "系列",
    })),
    universes: universes.map((item) => ({
      label: item.name,
      href: universePath(item),
      meta: "宇宙",
    })),
    externalLinks: [
      champion
        ? {
            label: `去布锅锅语音站收听${championName}的语音`,
            href: `https://voice.buguoguo.cn/#/voice/${champion.heroId}`,
          }
        : undefined,
      {
        label: "去哔哩哔哩查看该皮肤演示视频",
        href: `https://space.bilibili.com/9385598/search/video?keyword=${encodeURIComponent(skin.name)}`,
      },
      {
        label: "去卡达查看 3D 模型",
        href: `https://3d.buguoguo.cn/model-viewer?id=${skin.riotSkinId}`,
      },
    ].filter((item): item is SkinDetailViewerProps["externalLinks"][number] =>
      Boolean(item),
    ),
    prevSkin: prevSkin
      ? { label: prevSkin.name, href: skinPath(prevSkin) }
      : undefined,
    nextSkin: nextSkin
      ? { label: nextSkin.name, href: skinPath(nextSkin) }
      : undefined,
    visuals: buildVisuals(skin, chromas),
  };
}

function getChampionDisplayName(champion: Champion | undefined, skin: Skin) {
  if (!champion) {
    return skin.championName ?? `英雄 ${skin.championId}`;
  }

  return champion.title ? `${champion.title} ${champion.name}` : champion.name;
}

function sortSkinsByRelease(skins: Skin[]) {
  return [...skins].sort((left, right) => {
    const leftTime = Date.parse(left.releaseTime ?? "") || left.riotSkinId;
    const rightTime = Date.parse(right.releaseTime ?? "") || right.riotSkinId;
    return leftTime - rightTime || left.riotSkinId - right.riotSkinId;
  });
}

function resolveSkinlines(skin: Skin, allSkinlines: Skinline[]) {
  if (skin.skinlines?.length) {
    return skin.skinlines;
  }

  const ids = splitIdSet(skin.skinlineIdSets);
  const fromIds = allSkinlines.filter((skinline) =>
    ids.includes(skinline.riotSkinlineId),
  );

  if (fromIds.length) {
    return fromIds;
  }

  return (
    skin.skinlineNames?.map((name, index) => ({
      id: index,
      riotSkinlineId: index,
      name,
    })) ?? []
  );
}

function resolveUniverses(
  skin: Skin,
  skinlines: Skinline[],
  allUniverses: Universe[],
) {
  if (skin.universes?.length) {
    return skin.universes;
  }

  const skinlineIds = new Set(
    skinlines.map((skinline) => skinline.riotSkinlineId),
  );
  return allUniverses.filter((universe) =>
    splitIdSet(universe.lolSkinlineIdSets).some((id) => skinlineIds.has(id)),
  );
}

function splitIdSet(value?: string) {
  return (
    value
      ?.split(/[,;|]/)
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item)) ?? []
  );
}

function buildVisuals(skin: Skin, chromas: SkinChroma[]): SkinVisual[] {
  const baseVisual: SkinVisual = {
    id: `skin-${skin.riotSkinId}`,
    name: skin.name,
    imageUrl: normalizeImageUrl(
      skin.uncenteredSplashPath ?? skin.splashPath ?? skin.loadScreenPath,
      skin.isPbeOnly,
    ),
    focusImageUrl: normalizeImageUrl(
      skin.splashPath ?? skin.uncenteredSplashPath ?? skin.loadScreenPath,
      skin.isPbeOnly,
    ),
    videoUrl: normalizeImageUrl(skin.collectionSplashVideoPath, skin.isPbeOnly),
    focusVideoUrl: normalizeImageUrl(skin.splashVideoPath, skin.isPbeOnly),
    thumbUrl: normalizeImageUrl(
      skin.chromaPath ??
        skin.loadScreenVintagePath ??
        skin.loadScreenPath ??
        skin.tilePath ??
        skin.splashPath,
      skin.isPbeOnly,
    ),
    colors: [],
    description: skin.description,
  };

  const chromaVisuals = chromas.map((chroma) => ({
    id: `chroma-${chroma.id}`,
    name: chroma.name,
    isChroma: true,
    chromaImageUrl: normalizeImageUrl(chroma.chromaPath, skin.isPbeOnly),
    imageUrl: normalizeImageUrl(
      chroma.uncenteredSplashPath ??
        chroma.splashPath ??
        chroma.chromaPath ??
        chroma.tilePath ??
        skin.uncenteredSplashPath,
      skin.isPbeOnly,
    ),
    focusImageUrl: normalizeImageUrl(
      chroma.splashPath ??
        chroma.uncenteredSplashPath ??
        chroma.chromaPath ??
        skin.splashPath,
      skin.isPbeOnly,
    ),
    videoUrl: normalizeImageUrl(
      chroma.collectionSplashVideoPath,
      skin.isPbeOnly,
    ),
    focusVideoUrl: normalizeImageUrl(
      chroma.splashVideoPath ?? chroma.previewVideoUrl,
      skin.isPbeOnly,
    ),
    thumbUrl: normalizeImageUrl(
      chroma.chromaPath ??
        chroma.loadScreenVintagePath ??
        chroma.loadScreenPath ??
        chroma.tilePath ??
        chroma.splashPath ??
        skin.loadScreenPath,
      skin.isPbeOnly,
    ),
    colors: chroma.colors ?? [],
    description: chroma.description,
  }));

  return [baseVisual, ...chromaVisuals];
}

function parseSkinChromas(skin: Skin): SkinChroma[] {
  const chromasById = new Map<number, SkinChroma>();
  const raw = skin.chromasJson?.trim();

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      const items = Array.isArray(parsed)
        ? parsed
        : isRecord(parsed) && Array.isArray(parsed.chromas)
          ? parsed.chromas
          : [];
      items
        .map(normalizeChroma)
        .filter((item): item is SkinChroma => item !== undefined)
        .forEach((chroma) => chromasById.set(chroma.id, chroma));
    } catch {
      // The structured chroma list remains authoritative when the legacy JSON is invalid.
    }
  }

  skin.chromas?.forEach((chroma) => chromasById.set(chroma.id, chroma));

  return Array.from(chromasById.values());
}

function normalizeChroma(value: unknown): SkinChroma | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = numberOf(value.id);
  const name = stringOf(value.name);

  if (id === undefined || !name) {
    return undefined;
  }

  return {
    id,
    name,
    contentId: stringOf(value.contentId),
    chromaPath: stringOf(value.chromaPath),
    tilePath: stringOf(value.tilePath),
    splashPath: stringOf(value.splashPath),
    uncenteredSplashPath: stringOf(value.uncenteredSplashPath),
    loadScreenPath: stringOf(value.loadScreenPath),
    loadScreenVintagePath: stringOf(value.loadScreenVintagePath),
    splashVideoPath: stringOf(value.splashVideoPath),
    previewVideoUrl: stringOf(value.previewVideoUrl),
    collectionSplashVideoPath: stringOf(value.collectionSplashVideoPath),
    colors: stringArrayOf(value.colors),
    description: stringOf(value.description),
  };
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringOf(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberOf(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function stringArrayOf(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

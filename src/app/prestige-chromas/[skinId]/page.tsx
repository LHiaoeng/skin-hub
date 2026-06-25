import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  SkinDetailViewer,
  type SkinDetailViewerProps,
  type SkinVisual,
} from "@/app/skins/[skinId]/skin-detail-viewer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getChampion,
  getPrestigeChromas,
  getSkinlines,
  getUniverses,
} from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import {
  buildPrestigeChromaDescription,
  getPrestigeChromaImageUrl,
  getPrestigeChromaNavigation,
} from "@/lib/lol/prestige-chroma";
import {
  buildPrestigeChromaSeo,
  championPath,
  prestigeChromaPath,
  resolvePrestigeChromaRoute,
  skinlinePath,
  universePath,
} from "@/lib/routing/slug";
import { breadcrumbSchema, imageObjectSchema } from "@/lib/seo/schema";
import type { PrestigeChroma, SkinlineSummary, Universe } from "@/types/lol";

interface PrestigeChromaDetailPageProps {
  params: Promise<{
    skinId: string;
  }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const items = await getPrestigeChromasForStaticGeneration();

  return items.map((item) => ({
    skinId: prestigeChromaPath(item).slice("/prestige-chromas/".length),
  }));
}

async function getPrestigeChromasForStaticGeneration(): Promise<
  PrestigeChroma[]
> {
  try {
    return await getPrestigeChromas();
  } catch (error) {
    console.error(
      "[prestige-chromas] Failed to generate static params.",
      error,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: PrestigeChromaDetailPageProps): Promise<Metadata> {
  const { skinId } = await params;
  const resolution = resolvePrestigeChromaRoute(
    await getPrestigeChromas(),
    skinId,
  );

  if (!resolution) {
    return {
      title: "臻彩未找到",
    };
  }

  const description = buildPrestigeChromaDescription(resolution.item);
  const imageUrl = getPrestigeChromaImageUrl(resolution.item);
  const seo = buildPrestigeChromaSeo(resolution.item, description, imageUrl);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonicalPath,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.imageUrl
        ? [{ url: seo.imageUrl, alt: seo.imageAlt }]
        : undefined,
    },
  };
}

export default async function PrestigeChromaDetailPage({
  params,
}: PrestigeChromaDetailPageProps) {
  const { skinId } = await params;
  const items = await getPrestigeChromas();
  const resolution = resolvePrestigeChromaRoute(items, skinId);

  if (!resolution) {
    notFound();
  }

  if (resolution.shouldRedirect) {
    permanentRedirect(encodeURI(resolution.canonicalPath));
  }

  const item = resolution.item;
  const [champion, allSkinlines, allUniverses] = await Promise.all([
    getChampion(item.heroId),
    getSkinlines(),
    getUniverses(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${siteUrl}${resolution.canonicalPath}`;
  const description = buildPrestigeChromaDescription(item);
  const imageUrl = getPrestigeChromaImageUrl(item);
  const seo = buildPrestigeChromaSeo(item, description, imageUrl);

  return (
    <>
      <JsonLd
        data={imageObjectSchema({
          name: `${item.itemName}臻彩原画`,
          imageUrl: seo.imageUrl,
          pageUrl,
          description: seo.description,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: siteUrl },
          { name: "臻彩藏馆", url: `${siteUrl}/prestige-chromas` },
          { name: item.itemName, url: pageUrl },
        ])}
      />
      <SkinDetailViewer
        {...buildViewerProps({
          item,
          items,
          champion,
          allSkinlines,
          allUniverses,
          description: seo.description,
          imageUrl: seo.imageUrl,
        })}
      />
    </>
  );
}

function buildViewerProps({
  item,
  items,
  champion,
  allSkinlines,
  allUniverses,
  description,
  imageUrl,
}: {
  item: PrestigeChroma;
  items: PrestigeChroma[];
  champion: Awaited<ReturnType<typeof getChampion>>;
  allSkinlines: SkinlineSummary[];
  allUniverses: Universe[];
  description: string;
  imageUrl: string | undefined;
}): SkinDetailViewerProps {
  const { previousItem, nextItem } = getPrestigeChromaNavigation(items, item);
  const releaseTime = item.startDate?.trim() || item.startTime?.trim();
  const skinlineNames = relationNames(item.skinLines);
  const universeNames = relationNames(item.universes);
  const resolvedSkinlines = item.skinLines.flatMap((relation) => {
    const skinline = allSkinlines.find(
      (candidate) => candidate.riotSkinlineId === relation.id,
    );
    return skinline
      ? [{ label: relation.name, href: skinlinePath(skinline), meta: "系列" }]
      : [];
  });
  const resolvedUniverses = item.universes.flatMap((relation) => {
    const universe = allUniverses.find(
      (candidate) => candidate.lolUniverseId === relation.id,
    );
    return universe
      ? [{ label: relation.name, href: universePath(universe), meta: "宇宙" }]
      : [];
  });

  return {
    contentKind: "prestige-chroma",
    skinName: item.itemName,
    description,
    seoSummary: description,
    championName: champion?.name ?? item.heroName,
    championHref: champion ? championPath(champion) : undefined,
    rarityName: "",
    globalRarityName: "",
    rarityIconUrl: normalizeImageUrl(item.timgUrl),
    tags: [
      item.cname?.trim(),
      item.cid?.trim(),
      releaseTime,
      item.endTime?.trim(),
    ].filter((value): value is string => Boolean(value)),
    primaryDetailsTitle: "臻彩资料",
    cnDetails: [
      { label: "炫彩 ID", value: String(item.skinId) },
      { label: "英雄", value: item.heroName },
      ...(item.cname?.trim()
        ? [{ label: "分类", value: item.cname.trim() }]
        : []),
      ...(item.cid?.trim()
        ? [{ label: "分类 ID", value: item.cid.trim() }]
        : []),
      ...(releaseTime ? [{ label: "上线时间", value: releaseTime }] : []),
      ...(item.endTime?.trim()
        ? [{ label: "结束时间", value: item.endTime.trim() }]
        : []),
      ...(skinlineNames ? [{ label: "系列", value: skinlineNames }] : []),
      ...(universeNames ? [{ label: "宇宙", value: universeNames }] : []),
    ],
    globalDetails: [],
    relatedLinks: [],
    skinlines: resolvedSkinlines,
    universes: resolvedUniverses,
    externalLinks: [],
    prevSkin: previousItem
      ? { label: previousItem.itemName, href: prestigeChromaPath(previousItem) }
      : undefined,
    nextSkin: nextItem
      ? { label: nextItem.itemName, href: prestigeChromaPath(nextItem) }
      : undefined,
    visuals: [buildVisual(item, imageUrl, description)],
  };
}

function buildVisual(
  item: PrestigeChroma,
  imageUrl: string | undefined,
  description: string,
): SkinVisual {
  return {
    id: `prestige-chroma-${item.skinId}`,
    name: item.itemName,
    imageUrl,
    focusImageUrl: imageUrl,
    thumbUrl: imageUrl,
    colors: [],
    description,
  };
}

function relationNames(
  relations: PrestigeChroma["skinLines"],
): string | undefined {
  const names = relations.map(({ name }) => name.trim()).filter(Boolean);
  return names.length > 0 ? names.join("、") : undefined;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CollectionDetailLayout,
  CollectionSection,
  EmptyCollection,
  SkinGrid,
  SkinSortToolbar,
} from "@/components/collection-detail/collection-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { getLolDictionaries, getUniverse, getUniverses } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { parseSkinSort, sortSkins, type SkinSort } from "@/lib/lol/skin-sort";
import { getContentSection } from "@/lib/navigation/content-sections";
import { parseRouteId, skinlinePath, skinPath, universePath } from "@/lib/routing/slug";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import type { UniverseDetail, UniverseSkinline } from "@/types/lol";

interface UniverseDetailPageProps {
  params: Promise<{ universeId: string }>;
  searchParams?: Promise<{ sort?: string | string[]; order?: string | string[] }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const universes = await getUniverses();
  return universes.map((universe) => ({ universeId: universePath(universe).replace("/universes/", "") }));
}

export async function generateMetadata({ params }: UniverseDetailPageProps): Promise<Metadata> {
  const { universeId } = await params;
  const id = parseValidId(universeId);
  const universe = id ? await getUniverse(id) : undefined;

  if (!universe) {
    return { title: { absolute: "宇宙未找到 - Skin Hub" } };
  }

  const description = universe.description ?? `探索 ${universe.name} 皮肤宇宙，浏览其下的所有皮肤系列与内容。`;
  const imageUrl = getUniverseBackgrounds(universe)[0];
  return {
    title: { absolute: `${universe.name} - 皮肤宇宙 - Skin Hub` },
    description,
    alternates: { canonical: universePath(universe) },
    openGraph: {
      title: `${universe.name} - 皮肤宇宙 - Skin Hub`,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: `${universe.name} 皮肤宇宙代表图` }] : undefined,
    },
  };
}

export default async function UniverseDetailPage({ params, searchParams }: UniverseDetailPageProps) {
  const { universeId } = await params;
  const id = parseValidId(universeId);
  if (!id) notFound();

  const [universe, dictionaries, resolvedSearchParams] = await Promise.all([
    getUniverse(id),
    getLolDictionaries(),
    searchParams,
  ]);
  if (!universe) notFound();

  const sort = parseSkinSort(resolvedSearchParams);
  const sections = sortUniverseSkinlines(universe.skinlines, sort);
  const allSkins = sections.flatMap((section) => section.skins);
  const backgroundUrls = getUniverseBackgrounds(universe);
  const backgroundUrl = backgroundUrls[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const basePath = universePath(universe);
  const pageUrl = `${siteUrl}${basePath}`;
  const description = universe.description ?? `探索 ${universe.name} 皮肤宇宙，浏览其下的所有皮肤系列与内容。`;
  const SkinlineIcon = getContentSection("skinlines").icon;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: siteUrl },
          { name: "皮肤宇宙", url: `${siteUrl}/universes` },
          { name: universe.name, url: pageUrl },
        ])}
      />
      <JsonLd
        data={collectionPageSchema({
          name: `${universe.name} 皮肤宇宙`,
          description,
          url: pageUrl,
          imageUrl: backgroundUrl,
          items: allSkins.map((skin) => ({ name: skin.name, url: `${siteUrl}${skinPath(skin)}` })),
        })}
      />
      <CollectionDetailLayout
        backgroundUrls={backgroundUrls}
        breadcrumbs={[
          { label: "首页", href: "/" },
          { label: "皮肤宇宙", href: "/universes", sectionKey: "universes" },
          { label: universe.name, sectionKey: "universes", copyable: true },
        ]}
        title={universe.name}
        englishName={universe.engName}
        englishDescription={universe.engDescription}
        description={universe.description}
        descriptionPlaceholder="后端暂未提供该皮肤宇宙的中文描述。"
      >
        <SkinSortToolbar
          basePath={basePath}
          activeSort={sort}
          totalLabel={`${sections.length} 个皮肤套装 · ${allSkins.length} 款皮肤`}
        />
        {sections.length > 0 ? (
          sections.map((skinline) => (
            <CollectionSection
              title={skinline.name}
              href={skinlinePath(skinline)}
              icon={SkinlineIcon}
              key={skinline.riotSkinlineId}
            >
              {skinline.skins.length > 0 ? (
                <SkinGrid
                  skins={skinline.skins}
                  emblemDictItems={dictionaries.emblems}
                  rarityDictItems={dictionaries.cnRarity}
                  label={`${skinline.name} 皮肤列表`}
                />
              ) : (
                <EmptyCollection>该套装暂未关联公开皮肤。</EmptyCollection>
              )}
            </CollectionSection>
          ))
        ) : (
          <EmptyCollection>该宇宙暂未关联皮肤套装。</EmptyCollection>
        )}
      </CollectionDetailLayout>
    </>
  );
}

function sortUniverseSkinlines(skinlines: UniverseSkinline[], sort: SkinSort): UniverseSkinline[] {
  const sortedSkins = sortSkins(skinlines.flatMap((skinline) => skinline.skins), sort);
  const rank = new Map(sortedSkins.map((skin, index) => [skin.riotSkinId, index]));

  return skinlines
    .map((skinline) => ({
      ...skinline,
      skins: [...skinline.skins].sort(
        (left, right) =>
          (rank.get(left.riotSkinId) ?? Number.MAX_SAFE_INTEGER) -
          (rank.get(right.riotSkinId) ?? Number.MAX_SAFE_INTEGER),
      ),
    }))
    .sort((left, right) => firstRank(left, rank) - firstRank(right, rank));
}

function firstRank(skinline: UniverseSkinline, rank: Map<number, number>): number {
  return skinline.skins.length > 0
    ? (rank.get(skinline.skins[0].riotSkinId) ?? Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;
}

function getUniverseBackgrounds(universe: UniverseDetail): string[] {
  const fallbackSkin = universe.skinlines[0]?.skins[0];
  return uniqueUrls([
    normalizeImageUrl(universe.imagePath),
    normalizeImageUrl(fallbackSkin?.splashPath, fallbackSkin?.isPbeOnly),
  ]);
}

function uniqueUrls(urls: Array<string | undefined>): string[] {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

function parseValidId(value: string): number | undefined {
  const id = parseRouteId(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

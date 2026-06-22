import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CollectionDetailLayout,
  EmptyCollection,
  SkinGrid,
  SkinSortToolbar,
} from "@/components/collection-detail/collection-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { getLolDictionaries, getSkinline, getSkinlines } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { parseSkinSort, sortSkins } from "@/lib/lol/skin-sort";
import { getContentSection } from "@/lib/navigation/content-sections";
import { parseRouteId, skinlinePath, skinPath, universePath } from "@/lib/routing/slug";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/seo/schema";
import type { SkinlineDetail } from "@/types/lol";

const UniverseIcon = getContentSection("universes").icon;

interface SkinlineDetailPageProps {
  params: Promise<{ skinlineId: string }>;
  searchParams?: Promise<{ sort?: string | string[]; order?: string | string[] }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const skinlines = await getSkinlines();
  return skinlines.map((skinline) => ({ skinlineId: skinlinePath(skinline).replace("/skinlines/", "") }));
}

export async function generateMetadata({ params }: SkinlineDetailPageProps): Promise<Metadata> {
  const { skinlineId } = await params;
  const id = parseValidId(skinlineId);
  const skinline = id ? await getSkinline(id) : undefined;

  if (!skinline) {
    return { title: { absolute: "皮肤套装未找到 - Skin Hub" } };
  }

  const description = skinline.description ?? `探索 ${skinline.name} 皮肤套装，浏览其下的所有皮肤。`;
  const imageUrl = getSkinlineBackgrounds(skinline)[0];
  return {
    title: { absolute: `${skinline.name} - 皮肤套装 - Skin Hub` },
    description,
    alternates: { canonical: skinlinePath(skinline) },
    openGraph: {
      title: `${skinline.name} - 皮肤套装 - Skin Hub`,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: `${skinline.name} 皮肤套装原画` }] : undefined,
    },
  };
}

export default async function SkinlineDetailPage({ params, searchParams }: SkinlineDetailPageProps) {
  const { skinlineId } = await params;
  const id = parseValidId(skinlineId);
  if (!id) notFound();

  const [skinline, dictionaries, resolvedSearchParams] = await Promise.all([
    getSkinline(id),
    getLolDictionaries(),
    searchParams,
  ]);
  if (!skinline) notFound();

  const sort = parseSkinSort(resolvedSearchParams);
  const sortedSkins = sortSkins(skinline.skins, sort);
  const backgroundUrls = getSkinlineBackgrounds(skinline);
  const backgroundUrl = backgroundUrls[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const basePath = skinlinePath(skinline);
  const pageUrl = `${siteUrl}${basePath}`;
  const description = skinline.description ?? `探索 ${skinline.name} 皮肤套装，浏览其下的所有皮肤。`;
  const breadcrumbItems = [
    { name: "首页", url: siteUrl },
    ...(skinline.universe
      ? [
          { name: "皮肤宇宙", url: `${siteUrl}/universes` },
          { name: skinline.universe.name, url: `${siteUrl}${universePath(skinline.universe)}` },
        ]
      : [{ name: "皮肤套装", url: `${siteUrl}/skinlines` }]),
    { name: skinline.name, url: pageUrl },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <JsonLd
        data={collectionPageSchema({
          name: `${skinline.name} 皮肤套装`,
          description,
          url: pageUrl,
          imageUrl: backgroundUrl,
          items: sortedSkins.map((skin) => ({ name: skin.name, url: `${siteUrl}${skinPath(skin)}` })),
        })}
      />
      <CollectionDetailLayout
        backgroundUrls={backgroundUrls}
        breadcrumbs={[
          { label: "首页", href: "/" },
          ...(skinline.universe
            ? [
                { label: "皮肤宇宙", href: "/universes", sectionKey: "universes" as const },
                { label: skinline.universe.name, href: universePath(skinline.universe), sectionKey: "universes" as const },
              ]
            : [{ label: "皮肤套装", href: "/skinlines", sectionKey: "skinlines" as const }]),
          { label: skinline.name, sectionKey: "skinlines", copyable: true },
        ]}
        title={skinline.name}
        englishName={skinline.engName}
        englishDescription={skinline.engDescription}
        description={skinline.description}
        heroMeta={
          skinline.universe ? (
            <Badge variant="outline">
              <Link className="flex items-center gap-1.5" href={universePath(skinline.universe)}>
                <UniverseIcon aria-hidden="true" className="size-3.5" />
                {skinline.universe.name}
              </Link>
            </Badge>
          ) : null
        }
      >
        <SkinSortToolbar basePath={basePath} activeSort={sort} totalLabel={`${sortedSkins.length} 款皮肤`} />
        {sortedSkins.length > 0 ? (
          <SkinGrid
            skins={sortedSkins}
            emblemDictItems={dictionaries.emblems}
            rarityDictItems={dictionaries.cnRarity}
            label={`${skinline.name} 皮肤列表`}
          />
        ) : (
          <EmptyCollection>该套装暂未关联公开皮肤。</EmptyCollection>
        )}
      </CollectionDetailLayout>
    </>
  );
}

function getSkinlineBackgrounds(skinline: SkinlineDetail): string[] {
  const skin = skinline.skins.find((item) => item.uncenteredSplashPath || item.splashPath);
  return uniqueUrls([
    normalizeImageUrl(skin?.uncenteredSplashPath, skin?.isPbeOnly),
    normalizeImageUrl(skin?.splashPath, skin?.isPbeOnly),
  ]);
}

function uniqueUrls(urls: Array<string | undefined>): string[] {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}

function parseValidId(value: string): number | undefined {
  const id = parseRouteId(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

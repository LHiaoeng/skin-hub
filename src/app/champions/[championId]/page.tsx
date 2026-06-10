import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";

import { RarityBadge } from "@/components/home/rarity-badge";
import { JsonLd } from "@/components/seo/json-ld";
import { SkinEmblems } from "@/components/skin/skin-emblems";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { CopyButton } from "@/components/ui/copy-button";
import { getChampion, getChampionSkins, getChampions, getLolDictionaries } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { championPath, parseRouteId, skinPath } from "@/lib/routing/slug";
import { breadcrumbSchema } from "@/lib/seo/schema";
import type { Champion, Skin, SkinDictItem } from "@/types/lol";

import styles from "./page.module.css";
import { PointerActivity } from "./pointer-activity";

interface ChampionDetailPageProps {
  params: Promise<{
    championId: string;
  }>;
  searchParams?: Promise<{
    sort?: string | string[];
    order?: string | string[];
  }>;
}

type SortField = "release" | "rarity";
type SortOrder = "asc" | "desc";
type SkinSort = {
  field: SortField;
  order: SortOrder;
};

export const revalidate = 86400;

export async function generateStaticParams() {
  const champions = await getChampions();
  return champions.slice(0, 40).map((champion) => ({
    championId: championPath(champion).replace("/champions/", ""),
  }));
}

export async function generateMetadata({ params }: ChampionDetailPageProps): Promise<Metadata> {
  const { championId } = await params;
  const champion = await getChampion(parseRouteId(championId));

  if (!champion) {
    return {
      title: "英雄未找到",
    };
  }

  const skins = await getChampionSkins(champion.heroId);
  const baseSkin = findBaseSkin(skins);
  const imageUrl = normalizeImageUrl(baseSkin?.splashPath ?? champion.squarePortraitPath, baseSkin?.isPbeOnly);
  const description = champion.description ?? `${champion.name} 的国服英雄资料、英雄称号、背景描述和皮肤列表。`;

  return {
    title: `${champion.title ?? champion.name} - ${champion.name} 英雄资料`,
    description,
    alternates: {
      canonical: championPath(champion),
    },
    openGraph: {
      title: `${champion.name} 英雄资料`,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: `${champion.name} 英雄皮肤背景图` }] : undefined,
    },
  };
}

export default async function ChampionDetailPage({ params, searchParams }: ChampionDetailPageProps) {
  const { championId } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = getSortValue(resolvedSearchParams);
  const heroId = parseRouteId(championId);
  const [champion, skins, dictionaries] = await Promise.all([getChampion(heroId), getChampionSkins(heroId), getLolDictionaries()]);

  if (!champion) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${siteUrl}${championPath(champion)}`;
  const baseSkin = findBaseSkin(skins);
  const backgroundUrl = normalizeImageUrl(
    baseSkin?.splashPath ?? champion.squarePortraitPath,
    baseSkin?.isPbeOnly,
  );
  const sortedSkins = sortSkins(skins, sort);
  const zhTitle = champion.title ?? "称号未提供";
  const enName = champion.nameEng ?? "English name unavailable";
  const enTitle = champion.titleEng ?? "English title unavailable";
  const description = champion.description ?? "后端暂未提供该英雄的中文背景描述。";
  const fullChineseName = `${zhTitle} ${champion.name}`;
  const fullEnglishName = `${enTitle} ${enName}`;
  const roleLabels = splitCsv(champion.roles).map((role) => getDictText(dictionaries.championRoles, role));
  const positionLabels = champion.positions?.map((position) => getDictText(dictionaries.championPositions, position)) ?? [];

  return (
    <main className={styles.shell}>
      <PointerActivity />
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: siteUrl },
          { name: "英雄", url: `${siteUrl}/champions` },
          { name: fullChineseName, url: pageUrl },
        ])}
      />
      <JsonLd data={championSchema(champion, pageUrl, backgroundUrl)} />

      {backgroundUrl ? (
        <Image
          className={styles.background}
          src={backgroundUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
        />
      ) : null}
      <div className={styles.scrim} />

      <article className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="面包屑">
          <Link href="/">首页</Link>
          <span>/</span>
          <Link href="/champions">英雄</Link>
          <span>/</span>
          <span className={styles.copyText}>
            {fullChineseName}
            <CopyButton className={styles.actionButton} value={fullChineseName} />
          </span>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.titleGroup}>
              <h1>
                <span>{fullChineseName}</span>
              </h1>
            </div>
            <div className={styles.englishGroup}>
              <p>
                <span>{fullEnglishName}</span>
                <CopyButton className={styles.actionButton} value={fullEnglishName} />
              </p>
            </div>
            <div className={styles.description}>
              <p>
                {description}
                <CopyButton className={styles.actionButton} value={description} />
              </p>
            </div>
            <div className={styles.heroMeta}>
              {roleLabels.map((role) => (
                <span className={styles.tag} key={role}>
                  {role}
                </span>
              ))}
              {positionLabels.map((position) => (
                <span className={styles.tag} key={position}>
                  {position}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        <div className={styles.toolbar}>
          <ButtonGroup className={styles.sortLinks} aria-label="皮肤排序">
            <SortLink champion={champion} field="release" activeSort={sort}>
              发布时间
            </SortLink>
            <SortLink champion={champion} field="rarity" activeSort={sort}>
              皮肤品质
            </SortLink>
          </ButtonGroup>
          <span>{sortedSkins.length} 款皮肤</span>
        </div>

        {sortedSkins.length > 0 ? (
          <section className={styles.skinList} aria-label={`${champion.name} 皮肤列表`}>
            {sortedSkins.map((skin, index) => (
              <SkinTile
                skin={skin}
                key={skin.riotSkinId}
                priority={index < 4}
                emblemDictItems={dictionaries.emblems}
                rarityDictItems={dictionaries.cnRarity}
              />
            ))}
          </section>
        ) : (
          <section className={styles.empty}>公开接口暂未返回该英雄皮肤数据。</section>
        )}
      </article>
    </main>
  );
}

function SkinTile({
  skin,
  priority,
  emblemDictItems,
  rarityDictItems,
}: {
  skin: Skin;
  priority: boolean;
  emblemDictItems: SkinDictItem[];
  rarityDictItems: SkinDictItem[];
}) {
  const imageUrl = normalizeImageUrl(skin.tilePath ?? skin.loadScreenPath ?? skin.splashPath, skin.isPbeOnly);

  return (
    <Link className={styles.skinItem} href={skinPath(skin)} title={skin.name}>
      <span className={styles.skinThumb}>
        {imageUrl ? (
          <Image src={imageUrl} alt={`${skin.name} 皮肤卡片图`} fill priority={priority} sizes="(max-width: 720px) 46vw, 280px" />
        ) : (
          <span className={styles.imagePlaceholder}>No image</span>
        )}
        <SkinEmblems
          className={styles.emblems}
          dictItems={emblemDictItems}
          emblemNames={skin.emblemNames}
          isPbeOnly={skin.isPbeOnly}
        />
      </span>
      <span className={styles.skinName}>
        <RarityBadge
          regionRarityId={skin.regionRarityId}
          rarityGemPath={skin.rarityGemPath}
          isPbeOnly={skin.isPbeOnly}
          dictItems={rarityDictItems}
        />
        <strong title={skin.name}>{skin.name}</strong>
      </span>
    </Link>
  );
}

function SortLink({
  champion,
  field,
  activeSort,
  children,
}: {
  champion: Champion;
  field: SortField;
  activeSort: SkinSort;
  children: React.ReactNode;
}) {
  const nextOrder = getNextSortOrder(field, activeSort);
  const href =
    field === "release" && nextOrder === "asc"
      ? championPath(champion)
      : `${championPath(champion)}?sort=${field}&order=${nextOrder}`;

  return (
    <Button
      asChild
      className={[styles.actionButton, styles.sortButton, field === activeSort.field ? styles.active : ""]
        .filter(Boolean)
        .join(" ")}
      variant="outline"
    >
      <Link href={href}>
        {children}
        {field === activeSort.field ? <SortIcon order={activeSort.order} /> : null}
      </Link>
    </Button>
  );
}

function getNextSortOrder(field: SortField, activeSort: SkinSort): SortOrder {
  if (activeSort.field === field) {
    return activeSort.order === "asc" ? "desc" : "asc";
  }

  return field === "rarity" ? "desc" : "asc";
}

function SortIcon({ order }: { order: SortOrder }) {
  return order === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />;
}

function getSortValue(searchParams: { sort?: string | string[]; order?: string | string[] } | undefined): SkinSort {
  const field = getFirstParam(searchParams?.sort) === "rarity" ? "rarity" : "release";
  const order = getFirstParam(searchParams?.order) === "desc" ? "desc" : "asc";

  return { field, order };
}

function sortSkins(skins: Skin[], sort: SkinSort) {
  return [...skins].sort((left, right) => {
    const direction = sort.order === "asc" ? 1 : -1;

    if (sort.field === "rarity") {
      return (getRarityValue(left) - getRarityValue(right) || left.riotSkinId - right.riotSkinId) * direction;
    }

    const leftTime = Date.parse(left.releaseTime ?? "") || left.riotSkinId;
    const rightTime = Date.parse(right.releaseTime ?? "") || right.riotSkinId;
    return (leftTime - rightTime || left.riotSkinId - right.riotSkinId) * direction;
  });
}

function findBaseSkin(skins: Skin[]) {
  return skins.find((skin) => skin.isBase === 1) ?? skins.find((skin) => skin.name === skin.championName) ?? skins[0];
}

function splitCsv(value: string | undefined) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRarityValue(skin: Skin) {
  const numericRarity = Number(skin.rarity);
  if (Number.isFinite(numericRarity)) {
    return numericRarity;
  }

  return Number(skin.regionRarityId ?? 0);
}

function getDictText(items: SkinDictItem[], value: string) {
  const item = items.find((dictItem) => String(dictItem.value).toLowerCase() === value.toLowerCase());
  return item?.name?.trim() || item?.label?.trim() || value;
}

function championSchema(champion: Champion, pageUrl: string, imageUrl: string | undefined) {
  const fullChineseName = `${champion.title ?? "称号未提供"} ${champion.name}`;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${fullChineseName} 英雄资料`,
    url: pageUrl,
    primaryImageOfPage: imageUrl,
    description: champion.description ?? `${champion.name} 的 LOL 英雄资料和皮肤列表。`,
    about: {
      "@type": "Person",
      name: fullChineseName,
      alternateName: [champion.nameEng, champion.alias].filter(Boolean),
      description: champion.description,
    },
  };
}

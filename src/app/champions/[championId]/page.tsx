import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/ui/copy-button";
import { getChampion, getChampionSkins, getChampions } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { championPath, parseRouteId, skinPath } from "@/lib/routing/slug";

import styles from "./page.module.css";

interface ChampionDetailPageProps {
  params: Promise<{
    championId: string;
  }>;
  searchParams?: Promise<{
    sort?: string | string[];
  }>;
}

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

  return {
    title: `${champion.title ?? champion.name} - ${champion.name} 英雄资料`,
    description: `${champion.name} 的国服英雄资料、定位、位置和皮肤列表。`,
    alternates: {
      canonical: championPath(champion),
    },
  };
}

export default async function ChampionDetailPage({ params, searchParams }: ChampionDetailPageProps) {
  const { championId } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = getSortValue(resolvedSearchParams?.sort);
  const heroId = parseRouteId(championId);
  const [champion, skins] = await Promise.all([getChampion(heroId), getChampionSkins(heroId)]);

  if (!champion) {
    notFound();
  }

  const portraitUrl = normalizeImageUrl(champion.squarePortraitPath);
  const sortedSkins = [...skins].sort((left, right) =>
    sort === "asc" ? left.riotSkinId - right.riotSkinId : right.riotSkinId - left.riotSkinId,
  );

  return (
    <main className={styles.shell}>
      <nav className={styles.breadcrumb} aria-label="面包屑">
        <Link href="/">首页</Link>
        <span>/</span>
        <Link href="/champions">英雄</Link>
        <span>/</span>
        <span>{champion.name}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.portrait}>
          {portraitUrl ? <Image src={portraitUrl} alt={`${champion.name} 国服头像`} fill priority sizes="112px" /> : null}
        </div>
        <div>
          <h1>{champion.title ?? champion.name}</h1>
          <p className={styles.english}>
            {champion.name} {champion.nameEng ? ` / ${champion.nameEng}` : null}
            {champion.titleEng ? ` · ${champion.titleEng}` : null}
          </p>
          {champion.description ? <p className={styles.description}>{champion.description}</p> : null}
          <div className={styles.heroMeta}>
            {champion.roles?.split(",").filter(Boolean).map((role) => (
              <span className={styles.tag} key={role}>
                {role}
              </span>
            ))}
            {champion.positions?.map((position) => (
              <span className={styles.tag} key={position}>
                {position}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2>基本信息</h2>
          <div className={styles.copyGrid}>
            <CopyRow label="英雄 ID" value={champion.heroId} />
            <CopyRow label="中文名" value={champion.name} />
            <CopyRow label="称号" value={champion.title} />
            <CopyRow label="英文名" value={champion.nameEng} />
            <CopyRow label="英文称号" value={champion.titleEng} />
            <CopyRow label="别名" value={champion.alias} />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.skinHeader}>
            <h2>皮肤列表</h2>
            <div className={styles.sortLinks} aria-label="皮肤排序">
              <Link className={sort === "desc" ? styles.active : undefined} href={`${championPath(champion)}?sort=desc`}>
                ID 降序
              </Link>
              <Link className={sort === "asc" ? styles.active : undefined} href={`${championPath(champion)}?sort=asc`}>
                ID 升序
              </Link>
            </div>
          </div>

          {sortedSkins.length > 0 ? (
            <div className={styles.skinList}>
              {sortedSkins.map((skin) => {
                const imageUrl = normalizeImageUrl(skin.tilePath ?? skin.loadScreenPath ?? skin.splashPath, skin.isPbeOnly);
                return (
                  <Link className={styles.skinItem} href={skinPath(skin)} key={skin.riotSkinId}>
                    <span className={styles.skinThumb}>
                      {imageUrl ? <Image src={imageUrl} alt={`${skin.name} 小头像`} fill sizes="56px" /> : null}
                    </span>
                    <span>
                      <strong>{skin.name}</strong>
                      <span>{skin.riotSkinId}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>公开接口暂未返回该英雄皮肤数据。</div>
          )}
        </div>
      </section>
    </main>
  );
}

function CopyRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className={styles.copyItem}>
      <span>{label}</span>
      <code>{value ?? "未提供"}</code>
      <CopyButton value={value} />
    </div>
  );
}

function getSortValue(value: string | string[] | undefined) {
  const sort = Array.isArray(value) ? value[0] : value;
  return sort === "asc" ? "asc" : "desc";
}

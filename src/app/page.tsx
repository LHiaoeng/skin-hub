import Image from "next/image";
import Link from "next/link";

import { getHomeTabKey, HomeTabs } from "@/components/home/home-tabs";
import { RarityBadge } from "@/components/home/rarity-badge";
import { SectionTitle } from "@/components/home/section-title";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomeData } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { skinPath } from "@/lib/routing/slug";
import { websiteSchema } from "@/lib/seo/schema";

import styles from "./page.module.css";

export const revalidate = 3600;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{
    tab?: string | string[];
    role?: string | string[];
    position?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTab = getHomeTabKey(resolvedSearchParams?.tab);
  const championRole = getFirstSearchParam(resolvedSearchParams?.role);
  const championPosition = getFirstSearchParam(resolvedSearchParams?.position);
  const data = await getHomeData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className={styles.shell}>
      <JsonLd data={websiteSchema(siteUrl)} />

      <section className={styles.section} id="latest-skins">
        <SectionTitle title="PBE 新增" />
        {data.latestSkins.length > 0 ? (
          <div className={styles.latestList}>
            {data.latestSkins.map((skin, index) => {
              const imageUrl = normalizeImageUrl(skin.tilePath ?? skin.loadScreenPath ?? skin.splashPath, skin.isPbeOnly);
              return (
                <Link className={styles.latestItem} href={skinPath(skin)} key={skin.riotSkinId}>
                  <span className={styles.avatar}>
                    {imageUrl ? (
                      <Image src={imageUrl} alt={`${skin.name} 国服皮肤小头像`} fill priority={index < 6} sizes="72px" />
                    ) : null}
                  </span>
                  <span className={styles.info}>
                    <strong>{skin.name}</strong>
                  </span>
                  <RarityBadge
                    regionRarityId={skin.regionRarityId}
                    rarityGemPath={skin.rarityGemPath}
                    isPbeOnly={skin.isPbeOnly}
                    dictItems={data.dictionaries.cnRarity}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>公开接口暂未返回 `isPbeOnly=1` 的 PBE 新增皮肤数据。</div>
        )}
      </section>

      <HomeTabs
        activeTab={activeTab}
        champions={data.featuredChampions}
        championPositions={data.dictionaries.championPositions}
        championRoles={data.dictionaries.championRoles}
        selectedPosition={championPosition}
        selectedRole={championRole}
        universes={data.universes}
        skinlines={data.skinlines}
      />
    </main>
  );
}

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

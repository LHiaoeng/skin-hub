import Image from "next/image";
import Link from "next/link";
import { FlaskConical } from "lucide-react";

import { HomeTabs, type HomeTabKey } from "@/components/home/home-tabs";
import { RarityBadge } from "@/components/home/rarity-badge";
import { SectionTitle } from "@/components/home/section-title";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomeData } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import type { PrestigeChromaListOptions } from "@/lib/lol/prestige-chroma";
import type { SkinlineSort } from "@/lib/lol/skinline-sort";
import { skinPath } from "@/lib/routing/slug";
import { websiteSchema } from "@/lib/seo/schema";

import styles from "@/app/page.module.css";

export async function HomeContent({
  activeTab = "champions",
  championBasePath = "/",
  selectedRole,
  selectedPosition,
  skinlineSort,
  prestigeChromaOptions = { groupBy: "all", sortBy: "rank", order: "desc" },
}: {
  activeTab?: HomeTabKey;
  championBasePath?: "/" | "/champions";
  selectedRole?: string;
  selectedPosition?: string;
  skinlineSort?: SkinlineSort;
  prestigeChromaOptions?: PrestigeChromaListOptions;
}) {
  const data = await getHomeData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className={styles.shell}>
      <JsonLd data={websiteSchema(siteUrl)} />

      <section className={styles.section} id="latest-skins">
        <SectionTitle icon={FlaskConical} title="PBE 新增" />
        {data.latestSkins.length > 0 ? (
          <div className={styles.latestList}>
            {data.latestSkins.map((skin, index) => {
              const imageUrl = normalizeImageUrl(
                skin.tilePath ?? skin.loadScreenPath ?? skin.splashPath,
                skin.isPbeOnly,
              );

              return (
                <Link
                  className={styles.latestItem}
                  href={skinPath(skin)}
                  key={skin.riotSkinId}
                >
                  <span className={styles.avatar}>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${skin.name} 国服皮肤小头像`}
                        fill
                        priority={index < 6}
                        sizes="72px"
                      />
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
          <div className={styles.empty}>
            公开接口暂未返回 `isPbeOnly=1` 的 PBE 新增皮肤数据。
          </div>
        )}
      </section>

      <HomeTabs
        activeTab={activeTab}
        championBasePath={championBasePath}
        champions={data.featuredChampions}
        championPositions={data.dictionaries.championPositions}
        championRoles={data.dictionaries.championRoles}
        selectedPosition={selectedPosition}
        selectedRole={selectedRole}
        universes={data.universes}
        skinlines={data.skinlines}
        prestigeChromas={data.prestigeChromas}
        prestigeChromaOptions={prestigeChromaOptions}
        skinlineSort={skinlineSort}
      />
    </main>
  );
}

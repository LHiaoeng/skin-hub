import Image from "next/image";
import Link from "next/link";

import { normalizeImageUrl } from "@/lib/images/cdn";
import { championPath } from "@/lib/routing/slug";
import { UniversesTree } from "@/features/universes/universes-tree";
import type { Champion, SkinDictItem, Skinline, Universe } from "@/types/lol";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./home-tabs.module.css";

export type HomeTabKey = "champions" | "universes" | "skinlines" | "coming";

const tabs: Array<{ key: HomeTabKey; label: string; href: string }> = [
  { key: "champions", label: "英雄", href: "/champions" },
  { key: "universes", label: "皮肤宇宙", href: "/universes" },
  { key: "skinlines", label: "皮肤套装", href: "/skinlines" },
  { key: "coming", label: "后续内容", href: "/coming" },
];

function getChampionFilterHref({
  basePath,
  role,
  position,
}: {
  basePath: string;
  role?: string;
  position?: string;
}) {
  const searchParams = new URLSearchParams();
  if (role) searchParams.set("role", role);
  if (position) searchParams.set("position", position);
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

function getDictValue(item: SkinDictItem) {
  return item.value === undefined || item.value === null ? "" : String(item.value);
}

function getDictName(item: SkinDictItem) {
  return item.name?.trim() || item.label?.trim() || getDictValue(item);
}

function hasChampionRole(champion: Champion, role?: string) {
  if (!role) return true;
  return champion.roles?.split(",").map((r) => r.trim().toLowerCase()).includes(role.toLowerCase()) ?? false;
}

function hasChampionPosition(champion: Champion, position?: string) {
  if (!position) return true;
  return champion.positions?.some((p) => p.toLowerCase() === position.toLowerCase()) ?? false;
}

export function HomeTabs({
  champions,
  universes,
  skinlines,
  championRoles,
  championPositions,
  selectedRole,
  selectedPosition,
  activeTab = "champions",
  championBasePath = "/champions",
}: {
  champions: Champion[];
  universes: Universe[];
  skinlines: Skinline[];
  championRoles: SkinDictItem[];
  championPositions: SkinDictItem[];
  selectedRole?: string;
  selectedPosition?: string;
  activeTab?: HomeTabKey;
  championBasePath?: "/" | "/champions";
}) {
  const filteredChampions = champions.filter(
    (ch) => hasChampionRole(ch, selectedRole) && hasChampionPosition(ch, selectedPosition),
  );

  return (
    <section className={styles.section}>
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} asChild>
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="champions">
          <Card>
            <CardContent className="pt-6">
              <div className={styles.filters} aria-label="英雄筛选">
                <div className={styles.filterGroup}>
                  <span>位置</span>
                  <Link
                    className={!selectedPosition ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                    href={getChampionFilterHref({ basePath: championBasePath, role: selectedRole })}
                  >
                    全部
                  </Link>
                  {championPositions.map((item) => {
                    const value = getDictValue(item);
                    return value ? (
                      <Link
                        className={selectedPosition === value ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                        href={getChampionFilterHref({ basePath: championBasePath, role: selectedRole, position: value })}
                        key={value}
                      >
                        {getDictName(item)}
                      </Link>
                    ) : null;
                  })}
                </div>
                <div className={styles.filterGroup}>
                  <span>定位</span>
                  <Link
                    className={!selectedRole ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                    href={getChampionFilterHref({ basePath: championBasePath, position: selectedPosition })}
                  >
                    全部
                  </Link>
                  {championRoles.map((item) => {
                    const value = getDictValue(item);
                    return value ? (
                      <Link
                        className={selectedRole === value ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                        href={getChampionFilterHref({ basePath: championBasePath, role: value, position: selectedPosition })}
                        key={value}
                      >
                        {getDictName(item)}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
              {filteredChampions.length > 0 ? (
                <>
                  <div className={styles.resultBar}>
                    <span>共 {filteredChampions.length} 位英雄</span>
                  </div>
                  <div className={`${styles.grid} ${styles.championGrid}`}>
                    {filteredChampions.map((champion) => {
                      const imageUrl = normalizeImageUrl(champion.squarePortraitPath);
                      return (
                        <Link className={`${styles.card} ${styles.compactCard}`} href={championPath(champion)} key={champion.heroId}>
                          <span className={styles.championAvatar}>
                            {imageUrl ? <Image src={imageUrl} alt={`${champion.name} 国服头像`} fill sizes="42px" /> : null}
                          </span>
                          <span className={styles.championText}>
                            <strong>{champion.title ?? champion.name}</strong>
                            <span>{champion.name ?? champion.nameEng ?? "英雄资料"}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={styles.empty}>公开接口暂未返回符合条件的英雄数据。</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="universes">
          <Card>
            <CardContent className="pt-6">
              {universes.length > 0 ? (
                <UniversesTree universes={universes} skinlines={skinlines} />
              ) : (
                <div className={styles.empty}>公开接口暂未返回皮肤宇宙数据。</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skinlines">
          <Card>
            <CardContent className="pt-6">
              {skinlines.length > 0 ? (
                <div className={styles.grid}>
                  {skinlines.map((skinline) => (
                    <article className={styles.card} key={skinline.riotSkinlineId}>
                      <span className={styles.mark}>{skinline.engName?.slice(0, 2) ?? "SL"}</span>
                      <h3>{skinline.name}</h3>
                      <p>{skinline.description ?? skinline.engName ?? "国服皮肤套装资料"}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>公开接口暂未返回皮肤套装数据。</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coming">
          <Card>
            <CardContent className="pt-6">
              <div className={styles.comingGrid}>
                {["臻彩原画", "召唤师头像", "表情", "守卫皮肤"].map((item) => (
                  <article className={styles.comingCard} key={item}>
                    <span>Next</span>
                    <h3>{item}</h3>
                    <p>后续按国服公开数据源接入。</p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

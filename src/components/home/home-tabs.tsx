import Image from "next/image";
import Link from "next/link";

import { normalizeImageUrl } from "@/lib/images/cdn";
import {
  contentSections,
  type ContentSectionKey,
} from "@/lib/navigation/content-sections";
import { championPath } from "@/lib/routing/slug";
import { UniversesTree } from "@/features/universes/universes-tree";
import type {
  Champion,
  PrestigeChroma,
  SkinDictItem,
  SkinlineSummary,
  Universe,
} from "@/types/lol";
import type { PrestigeChromaListOptions } from "@/lib/lol/prestige-chroma";
import type { SkinlineSort } from "@/lib/lol/skinline-sort";
import { SkinlineList } from "@/components/home/skinline-list";
import { PrestigeChromaList } from "@/components/home/prestige-chroma-list";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./home-tabs.module.css";

export type HomeTabKey = ContentSectionKey;

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
  return item.value === undefined || item.value === null
    ? ""
    : String(item.value);
}

function getDictName(item: SkinDictItem) {
  return item.name?.trim() || item.label?.trim() || getDictValue(item);
}

function hasChampionRole(champion: Champion, role?: string) {
  if (!role) return true;
  return (
    champion.roles
      ?.split(",")
      .map((r) => r.trim().toLowerCase())
      .includes(role.toLowerCase()) ?? false
  );
}

function hasChampionPosition(champion: Champion, position?: string) {
  if (!position) return true;
  return (
    champion.positions?.some(
      (p) => p.toLowerCase() === position.toLowerCase(),
    ) ?? false
  );
}

export function HomeTabs({
  champions,
  universes,
  skinlines,
  prestigeChromas,
  championRoles,
  championPositions,
  selectedRole,
  selectedPosition,
  activeTab = "champions",
  championBasePath = "/champions",
  skinlineSort = { key: "name", order: "asc" },
  prestigeChromaOptions = { groupBy: "all", sortBy: "rank", order: "desc" },
}: {
  champions: Champion[];
  universes: Universe[];
  skinlines: SkinlineSummary[];
  prestigeChromas: PrestigeChroma[];
  championRoles: SkinDictItem[];
  championPositions: SkinDictItem[];
  selectedRole?: string;
  selectedPosition?: string;
  activeTab?: HomeTabKey;
  championBasePath?: "/" | "/champions";
  skinlineSort?: SkinlineSort;
  prestigeChromaOptions?: PrestigeChromaListOptions;
}) {
  const filteredChampions = champions.filter(
    (ch) =>
      hasChampionRole(ch, selectedRole) &&
      hasChampionPosition(ch, selectedPosition),
  );

  return (
    <section className={styles.section}>
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="mb-4">
          {contentSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger key={section.key} value={section.key} asChild>
                <Link href={section.href}>
                  <Icon aria-hidden="true" className={styles.tabIcon} />
                  {section.label}
                </Link>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="champions">
          <Card>
            <CardContent className="pt-6">
              <div className={styles.filters} aria-label="英雄筛选">
                <div className={styles.filterGroup}>
                  <span>位置</span>
                  <ButtonGroup aria-label="英雄位置筛选">
                    <ChampionFilterButton
                      active={!selectedPosition}
                      href={getChampionFilterHref({
                        basePath: championBasePath,
                        role: selectedRole,
                      })}
                    >
                      全部
                    </ChampionFilterButton>
                    {championPositions.map((item) => {
                      const value = getDictValue(item);
                      return value ? (
                        <ChampionFilterButton
                          active={selectedPosition === value}
                          href={getChampionFilterHref({
                            basePath: championBasePath,
                            role: selectedRole,
                            position: value,
                          })}
                          key={value}
                        >
                          {getDictName(item)}
                        </ChampionFilterButton>
                      ) : null;
                    })}
                  </ButtonGroup>
                </div>
                <div className={styles.filterGroup}>
                  <span>定位</span>
                  <ButtonGroup aria-label="英雄定位筛选">
                    <ChampionFilterButton
                      active={!selectedRole}
                      href={getChampionFilterHref({
                        basePath: championBasePath,
                        position: selectedPosition,
                      })}
                    >
                      全部
                    </ChampionFilterButton>
                    {championRoles.map((item) => {
                      const value = getDictValue(item);
                      return value ? (
                        <ChampionFilterButton
                          active={selectedRole === value}
                          href={getChampionFilterHref({
                            basePath: championBasePath,
                            role: value,
                            position: selectedPosition,
                          })}
                          key={value}
                        >
                          {getDictName(item)}
                        </ChampionFilterButton>
                      ) : null;
                    })}
                  </ButtonGroup>
                </div>
              </div>
              {filteredChampions.length > 0 ? (
                <>
                  <div className={styles.resultBar}>
                    <span>共 {filteredChampions.length} 位英雄</span>
                  </div>
                  <div className={`${styles.grid} ${styles.championGrid}`}>
                    {filteredChampions.map((champion) => {
                      const imageUrl = normalizeImageUrl(
                        champion.squarePortraitPath,
                      );
                      return (
                        <Link
                          className={`${styles.card} ${styles.compactCard}`}
                          href={championPath(champion)}
                          key={champion.heroId}
                        >
                          <span className={styles.championAvatar}>
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={`${champion.name} 国服头像`}
                                fill
                                sizes="42px"
                              />
                            ) : null}
                          </span>
                          <span className={styles.championText}>
                            <strong>{champion.title ?? champion.name}</strong>
                            <span>
                              {champion.name ?? champion.nameEng ?? "英雄资料"}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={styles.empty}>
                  公开接口暂未返回符合条件的英雄数据。
                </div>
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
                <div className={styles.empty}>
                  公开接口暂未返回皮肤宇宙数据。
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skinlines">
          <Card>
            <CardContent className="pt-6">
              {skinlines.length > 0 ? (
                <SkinlineList skinlines={skinlines} sort={skinlineSort} />
              ) : (
                <div className={styles.empty}>
                  公开接口暂未返回皮肤套装数据。
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prestige-chromas">
          <Card>
            <CardContent className="pt-6">
              {prestigeChromas.length > 0 ? (
                <PrestigeChromaList
                  items={prestigeChromas}
                  options={prestigeChromaOptions}
                />
              ) : (
                <div className={styles.empty}>
                  公开接口暂未返回臻彩皮肤数据。
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coming">
          <Card>
            <CardContent className="pt-6">
              <div className={styles.comingGrid}>
                {["召唤师头像", "表情", "守卫皮肤"].map((item) => (
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

function ChampionFilterButton({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      asChild
      className={active ? "bg-accent text-accent-foreground" : undefined}
      size="sm"
      variant="outline"
    >
      <Link href={href} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    </Button>
  );
}

import Image from "next/image";
import Link from "next/link";

import { normalizeImageUrl } from "@/lib/images/cdn";
import type { Champion, SkinDictItem, Skinline, Universe } from "@/types/lol";

import styles from "./home-tabs.module.css";

type TabKey = "champions" | "universes" | "skinlines" | "coming";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "champions", label: "英雄" },
  { key: "universes", label: "皮肤宇宙" },
  { key: "skinlines", label: "皮肤套装" },
  { key: "coming", label: "后续内容" },
];

export function getHomeTabKey(value: string | string[] | null | undefined): TabKey {
  const tabValue = Array.isArray(value) ? value[0] : value;
  return tabs.some((tab) => tab.key === tabValue) ? (tabValue as TabKey) : "champions";
}

function getTabHref(tab: TabKey) {
  return tab === "champions" ? "/" : `/?tab=${tab}`;
}

function getChampionFilterHref({ role, position }: { role?: string; position?: string }) {
  const searchParams = new URLSearchParams();

  if (role) {
    searchParams.set("role", role);
  }

  if (position) {
    searchParams.set("position", position);
  }

  const queryString = searchParams.toString();
  return queryString ? `/?${queryString}` : "/";
}

function getDictValue(item: SkinDictItem) {
  return item.value === undefined || item.value === null ? "" : String(item.value);
}

function getDictName(item: SkinDictItem) {
  return item.name?.trim() || item.label?.trim() || getDictValue(item);
}

function hasChampionRole(champion: Champion, role?: string) {
  if (!role) {
    return true;
  }

  return champion.roles
    ?.split(",")
    .map((item) => item.trim().toLowerCase())
    .includes(role.toLowerCase()) ?? false;
}

function hasChampionPosition(champion: Champion, position?: string) {
  if (!position) {
    return true;
  }

  return champion.positions?.some((item) => item.toLowerCase() === position.toLowerCase()) ?? false;
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
}: {
  champions: Champion[];
  universes: Universe[];
  skinlines: Skinline[];
  championRoles: SkinDictItem[];
  championPositions: SkinDictItem[];
  selectedRole?: string;
  selectedPosition?: string;
  activeTab?: TabKey;
}) {
  const filteredChampions = champions.filter(
    (champion) => hasChampionRole(champion, selectedRole) && hasChampionPosition(champion, selectedPosition),
  );

  return (
    <section className={styles.section}>
      <div className={styles.tabs} role="tablist" aria-label="内容分类">
        {tabs.map((tab) => (
          <Link
            className={activeTab === tab.key ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            href={getTabHref(tab.key)}
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === "champions" ? (
        <>
          <div className={styles.filters} aria-label="英雄筛选">
            <div className={styles.filterGroup}>
              <span>位置</span>
              <Link
                className={!selectedPosition ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                href={getChampionFilterHref({ role: selectedRole })}
              >
                全部
              </Link>
              {championPositions.map((item) => {
                const value = getDictValue(item);
                return value ? (
                  <Link
                    className={selectedPosition === value ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                    href={getChampionFilterHref({ role: selectedRole, position: value })}
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
                href={getChampionFilterHref({ position: selectedPosition })}
              >
                全部
              </Link>
              {championRoles.map((item) => {
                const value = getDictValue(item);
                return value ? (
                  <Link
                    className={selectedRole === value ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                    href={getChampionFilterHref({ role: value, position: selectedPosition })}
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
                    <article className={`${styles.card} ${styles.compactCard}`} key={champion.heroId}>
                      {imageUrl ? <Image src={imageUrl} alt={`${champion.name} 国服头像`} width={52} height={52} /> : null}
                      <div>
                        <h3>{champion.title ?? champion.name}</h3>
                        <p>{champion.name ?? champion.nameEng ?? "英雄资料"}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.empty}>公开接口暂未返回符合条件的英雄数据。</div>
          )}
        </>
      ) : null}

      {activeTab === "universes" ? (
        universes.length > 0 ? (
          <div className={styles.grid}>
            {universes.map((universe) => {
              const imageUrl = normalizeImageUrl(universe.imagePath);
              return (
                <article className={`${styles.card} ${styles.imageCard}`} key={universe.lolUniverseId}>
                  {imageUrl ? (
                    <Image src={imageUrl} alt={`${universe.name} 国服视觉图`} fill sizes="(max-width: 760px) 100vw, 33vw" />
                  ) : null}
                  <div>
                    <p>{universe.engName ?? "Universe"}</p>
                    <h3>{universe.name}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>公开接口暂未返回皮肤宇宙数据。</div>
        )
      ) : null}

      {activeTab === "skinlines" ? (
        skinlines.length > 0 ? (
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
        )
      ) : null}

      {activeTab === "coming" ? (
        <div className={styles.comingGrid}>
          {["臻彩原画", "召唤师头像", "表情", "守卫皮肤"].map((item) => (
            <article className={styles.comingCard} key={item}>
              <span>Next</span>
              <h3>{item}</h3>
              <p>后续按国服公开数据源接入。</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

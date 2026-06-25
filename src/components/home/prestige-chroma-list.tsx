import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownNarrowWide,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarDays,
  FileDigit,
  List,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { PrestigeChromaCategorySelect } from "@/components/home/prestige-chroma-category-select";
import { normalizeImageUrl } from "@/lib/images/cdn";
import {
  getPrestigeChromaCardGroups,
  getPrestigeChromaCardImageUrl,
  getPrestigeChromaCardTitle,
  getPrestigeChromaCategoryOptions,
  getPrestigeChromaTagImageUrl,
  type PrestigeChromaGroupKey,
  type PrestigeChromaListOptions,
  type PrestigeChromaSortKey,
  type PrestigeChromaSortOrder,
} from "@/lib/lol/prestige-chroma";
import { getContentSection } from "@/lib/navigation/content-sections";
import { prestigeChromaPath } from "@/lib/routing/slug";
import type { PrestigeChroma } from "@/types/lol";

import styles from "./home-tabs.module.css";

const PrestigeChromaIcon = getContentSection("prestige-chromas").icon;
const ChampionIcon = getContentSection("champions").icon;
const UniverseIcon = getContentSection("universes").icon;
const SkinlineIcon = getContentSection("skinlines").icon;

const groupControls: Array<{
  key: PrestigeChromaGroupKey;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "all", label: "所有", icon: List },
  { key: "champion", label: "英雄", icon: ChampionIcon },
  { key: "universe", label: "皮肤宇宙", icon: UniverseIcon },
  { key: "skinline", label: "皮肤套装", icon: SkinlineIcon },
];

const sortControls: Array<{
  key: PrestigeChromaSortKey;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "rank", label: "上线时间", icon: CalendarDays },
  { key: "count", label: "数量", icon: FileDigit },
];

export function PrestigeChromaList({
  items,
  options,
}: {
  items: PrestigeChroma[];
  options: PrestigeChromaListOptions;
}) {
  const groups = getPrestigeChromaCardGroups(items, options);
  const categoryOptions = getPrestigeChromaCategoryOptions(items);
  const visibleCount = groups.reduce(
    (total, group) => total + group.items.length,
    0,
  );
  const GroupHeadingIcon =
    groupControls.find((control) => control.key === options.groupBy)?.icon ??
    PrestigeChromaIcon;
  const sortControlsForGroup =
    options.groupBy === "all"
      ? sortControls.filter((control) => control.key === "rank")
      : sortControls;

  return (
    <div className={styles.prestigeChromaList}>
      <div className={styles.prestigeChromaToolbar}>
        <ButtonGroup aria-label="臻彩原画分组">
          {groupControls.map((control) => {
            const Icon = control.icon;
            return (
              <Button
                asChild
                className={
                  options.groupBy === control.key
                    ? "bg-accent text-accent-foreground"
                    : undefined
                }
                key={control.key}
                size="sm"
                variant="outline"
              >
                <Link
                  href={prestigeChromaListHref({
                    groupBy: control.key,
                    sortBy: control.key === "all" ? "rank" : options.sortBy,
                    order: options.order,
                    categoryId: options.categoryId,
                  })}
                  aria-current={
                    options.groupBy === control.key ? "page" : undefined
                  }
                >
                  <Icon data-icon="inline-start" />
                  {control.label}
                </Link>
              </Button>
            );
          })}
        </ButtonGroup>
        <ButtonGroup aria-label="臻彩原画排序">
          {sortControlsForGroup.map((control) => {
            const Icon = control.icon;
            const active = options.sortBy === control.key;
            const nextOrder =
              active && options.order === "asc" ? "desc" : "asc";
            const DirectionIcon = getSortDirectionIcon(
              control.key,
              options.order,
            );

            return (
              <Button
                asChild
                className={
                  active ? "bg-accent text-accent-foreground" : undefined
                }
                key={control.key}
                size="sm"
                variant="outline"
              >
                <Link
                  href={prestigeChromaListHref({
                    groupBy: options.groupBy,
                    sortBy: control.key,
                    order: nextOrder,
                    categoryId: options.categoryId,
                  })}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon data-icon="inline-start" />
                  {control.label}
                  {active ? <DirectionIcon data-icon="inline-end" /> : null}
                </Link>
              </Button>
            );
          })}
          <PrestigeChromaCategorySelect
            categories={categoryOptions}
            options={options}
          />
        </ButtonGroup>
        <span>共 {visibleCount} 款臻彩原画</span>
      </div>

      <div className={styles.prestigeChromaGroups}>
        {options.groupBy === "all" ? (
          <div className={`${styles.grid} ${styles.prestigeChromaGrid}`}>
            {(groups[0]?.items ?? []).map((item, index) => (
              <PrestigeChromaCard
                item={item}
                key={`all-${item.skinId}`}
                priority={index < 8}
              />
            ))}
          </div>
        ) : (
          groups.map((group) => (
            <section className={styles.prestigeChromaGroup} key={group.key}>
              <h2>
                {group.href ? (
                  <Link
                    className={styles.prestigeChromaGroupLink}
                    href={group.href}
                  >
                    <GroupHeadingIcon aria-hidden="true" />
                    <span>{group.label}</span>
                    <small>{group.items.length} 款</small>
                  </Link>
                ) : (
                  <>
                    <GroupHeadingIcon aria-hidden="true" />
                    <span>{group.label}</span>
                    <small>{group.items.length} 款</small>
                  </>
                )}
              </h2>
              <div className={`${styles.grid} ${styles.prestigeChromaGrid}`}>
                {group.items.map((item, index) => (
                  <PrestigeChromaCard
                    item={item}
                    key={`${group.key}-${item.skinId}`}
                    priority={index < 8 && groups[0]?.key === group.key}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function PrestigeChromaCard({
  item,
  priority,
}: {
  item: PrestigeChroma;
  priority: boolean;
}) {
  const imageUrl = getPrestigeChromaCardImageUrl(item);
  const tagImageUrl = normalizeImageUrl(getPrestigeChromaTagImageUrl(item));

  return (
    <Link
      className={`${styles.card} ${styles.prestigeChromaCard}`}
      href={prestigeChromaPath(item)}
    >
      <span className={styles.prestigeChromaImage}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${item.itemName} 臻彩原画`}
            fill
            priority={priority}
            sizes="(max-width: 720px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : null}
        {tagImageUrl ? (
          <span className={styles.prestigeChromaTag}>
            <Image src={tagImageUrl} alt="" width={72} height={72} />
          </span>
        ) : null}
      </span>
      <strong className={styles.prestigeChromaName}>
        {getPrestigeChromaCardTitle(item)}
      </strong>
    </Link>
  );
}

function prestigeChromaListHref({
  groupBy,
  sortBy,
  order,
  categoryId,
}: {
  groupBy: PrestigeChromaGroupKey;
  sortBy: PrestigeChromaSortKey;
  order: PrestigeChromaSortOrder;
  categoryId?: string;
}) {
  const searchParams = new URLSearchParams({
    group: groupBy,
    sort: sortBy,
    order,
  });
  if (categoryId) {
    searchParams.set("category", categoryId);
  }

  return `/prestige-chromas?${searchParams.toString()}`;
}

function getSortDirectionIcon(
  sortBy: PrestigeChromaSortKey,
  order: PrestigeChromaSortOrder,
) {
  if (sortBy === "count") {
    return order === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  }

  return order === "asc" ? ArrowUpNarrowWide : ArrowDownNarrowWide;
}

import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpNarrowWide,
  FileDigit,
  Languages,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { sortSkinlines, type SkinlineSort } from "@/lib/lol/skinline-sort";
import { getContentSection } from "@/lib/navigation/content-sections";
import { skinlinePath } from "@/lib/routing/slug";
import type { SkinlineSummary } from "@/types/lol";

import styles from "./skinline-list.module.css";

const SkinlineIcon = getContentSection("skinlines").icon;

export function SkinlineList({
  skinlines,
  sort,
}: {
  skinlines: SkinlineSummary[];
  sort: SkinlineSort;
}) {
  const sortedSkinlines = sortSkinlines(skinlines, sort);
  const nameOrder =
    sort.key === "name" && sort.order === "asc" ? "desc" : "asc";
  const countOrder =
    sort.key === "count" && sort.order === "asc" ? "desc" : "asc";

  return (
    <div>
      <div className={styles.toolbar}>
        <ButtonGroup aria-label="皮肤套装排序">
          <Button
            asChild
            className={
              sort.key === "name"
                ? "bg-accent text-accent-foreground"
                : undefined
            }
            size="sm"
            variant="outline"
          >
            <Link
              href={`/skinlines?sort=name&order=${nameOrder}`}
              aria-current={sort.key === "name" ? "page" : undefined}
            >
              <Languages data-icon="inline-start" />
              名称
              {sort.key === "name" ? (
                sort.order === "asc" ? (
                  <ArrowUpAZ data-icon="inline-end" />
                ) : (
                  <ArrowDownAZ data-icon="inline-end" />
                )
              ) : null}
            </Link>
          </Button>
          <Button
            asChild
            className={
              sort.key === "count"
                ? "bg-accent text-accent-foreground"
                : undefined
            }
            size="sm"
            variant="outline"
          >
            <Link
              href={`/skinlines?sort=count&order=${countOrder}`}
              aria-current={sort.key === "count" ? "page" : undefined}
            >
              <FileDigit data-icon="inline-start" />
              皮肤数量
              {sort.key === "count" ? (
                sort.order === "asc" ? (
                  <ArrowUpNarrowWide data-icon="inline-end" />
                ) : (
                  <ArrowDownWideNarrow data-icon="inline-end" />
                )
              ) : null}
            </Link>
          </Button>
        </ButtonGroup>
        <span>共 {sortedSkinlines.length} 个套装</span>
      </div>

      <div className={styles.grid} role="list">
        {sortedSkinlines.map((skinline) => (
          <Item
            asChild
            className={styles.item}
            key={skinline.riotSkinlineId}
            size="sm"
            variant="outline"
          >
            <Link href={skinlinePath(skinline)}>
              <ItemContent className={styles.itemContent}>
                <ItemTitle className={styles.itemTitle}>
                  <SkinlineIcon
                    aria-hidden="true"
                    className={styles.itemIcon}
                  />
                  <span>{skinline.name}</span>
                </ItemTitle>
                <ItemDescription className={styles.itemDescription}>
                  共 {skinline.skinCount} 款皮肤
                </ItemDescription>
              </ItemContent>
            </Link>
          </Item>
        ))}
      </div>
    </div>
  );
}

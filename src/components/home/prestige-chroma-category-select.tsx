import Link from "next/link";
import Image from "next/image";
import { ChevronDown, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  PrestigeChromaCategoryOption,
  PrestigeChromaListOptions,
  PrestigeChromaSortKey,
  PrestigeChromaSortOrder,
} from "@/lib/lol/prestige-chroma";
import { normalizeImageUrl } from "@/lib/images/cdn";

import styles from "./home-tabs.module.css";

export function PrestigeChromaCategorySelect({
  categories,
  options,
}: {
  categories: PrestigeChromaCategoryOption[];
  options: PrestigeChromaListOptions;
}) {
  const activeCategory = categories.find(
    (category) => category.id === options.categoryId,
  );
  const active = Boolean(options.categoryId);
  const resetHref = prestigeChromaCategoryHref({
    categoryId: undefined,
    groupBy: options.groupBy,
    sortBy: options.sortBy,
    order: options.order,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={active ? "bg-accent text-accent-foreground" : undefined}
            size="sm"
            variant="outline"
          >
            {activeCategory ? <CategoryIcon category={activeCategory} /> : null}
            {activeCategory?.label ?? "臻彩分类"}
            <ChevronDown data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href={prestigeChromaCategoryHref({
                  categoryId: undefined,
                  groupBy: options.groupBy,
                  sortBy: options.sortBy,
                  order: options.order,
                })}
                aria-current={!options.categoryId ? "page" : undefined}
              >
                全部分类
              </Link>
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem asChild key={category.id}>
                <Link
                  href={prestigeChromaCategoryHref({
                    categoryId: category.id,
                    groupBy: options.groupBy,
                    sortBy: options.sortBy,
                    order: options.order,
                  })}
                  aria-current={
                    options.categoryId === category.id ? "page" : undefined
                  }
                >
                  <CategoryIcon category={category} />
                  {category.label}（{category.count}）
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button asChild disabled={!active} size="sm" variant="outline">
        <Link
          href={resetHref}
          aria-disabled={!active}
          tabIndex={active ? undefined : -1}
        >
          <RotateCcw data-icon="inline-start" />
          重置
        </Link>
      </Button>
    </>
  );
}

function CategoryIcon({
  category,
}: {
  category: PrestigeChromaCategoryOption;
}) {
  const iconUrl = normalizeImageUrl(category.iconUrl);
  if (!iconUrl) return null;

  return (
    <span className={styles.prestigeChromaCategoryIcon} aria-hidden="true">
      <Image src={iconUrl} alt="" width={20} height={20} />
    </span>
  );
}

function prestigeChromaCategoryHref({
  categoryId,
  groupBy,
  sortBy,
  order,
}: {
  categoryId: string | undefined;
  groupBy: PrestigeChromaListOptions["groupBy"];
  sortBy: PrestigeChromaSortKey;
  order: PrestigeChromaSortOrder;
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ, ArrowUpNarrowWide, FileDigit, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tree, TreeFile } from "@/components/ui/file-tree";
import { getContentSection } from "@/lib/navigation/content-sections";
import { skinlinePath, universePath } from "@/lib/routing/slug";
import type { Universe, Skinline } from "@/types/lol";

const UniverseIcon = getContentSection("universes").icon;
const SkinlineIcon = getContentSection("skinlines").icon;

function parseSkinlineIds(lolSkinlineIdSets?: string): number[] {
  if (!lolSkinlineIdSets) return [];
  return lolSkinlineIdSets.split(",").map((id) => Number(id.trim())).filter((id) => !isNaN(id) && id > 0);
}

type SortKey = "name" | "skinlineCount";
type SortOrder = "asc" | "desc";

interface UniversesTreeProps {
  universes: Universe[];
  skinlines: Skinline[];
}

export function UniversesTree({ universes, skinlines }: UniversesTreeProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const skinlineMap = useMemo(() => {
    const map = new Map<number, Skinline>();
    for (const sl of skinlines) {
      map.set(sl.riotSkinlineId, sl);
    }
    return map;
  }, [skinlines]);

  const universeSkinlineCount = useMemo(() => {
    const count = new Map<number, number>();
    for (const u of universes) {
      count.set(u.lolUniverseId, parseSkinlineIds(u.lolSkinlineIdSets).length);
    }
    return count;
  }, [universes]);

  const sortedUniverses = useMemo(() => {
    return [...universes].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = (a.name ?? "").localeCompare(b.name ?? "");
      } else {
        const aCount = universeSkinlineCount.get(a.lolUniverseId) ?? 0;
        const bCount = universeSkinlineCount.get(b.lolUniverseId) ?? 0;
        cmp = aCount - bCount;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [universes, sortKey, sortOrder, universeSkinlineCount]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <ButtonGroup aria-label="皮肤宇宙排序">
          <Button
            className={sortKey === "name" ? "bg-accent text-accent-foreground" : undefined}
            variant="outline"
            size="sm"
            onClick={() => toggleSort("name")}
          >
            <Languages data-icon="inline-start" />
            名称
            {sortKey === "name" ? (
              sortOrder === "asc" ? <ArrowUpAZ data-icon="inline-end" /> : <ArrowDownAZ data-icon="inline-end" />
            ) : null}
          </Button>
          <Button
            className={sortKey === "skinlineCount" ? "bg-accent text-accent-foreground" : undefined}
            variant="outline"
            size="sm"
            onClick={() => toggleSort("skinlineCount")}
          >
            <FileDigit data-icon="inline-start" />
            套装数量
            {sortKey === "skinlineCount" ? (
              sortOrder === "asc" ? (
                <ArrowUpNarrowWide data-icon="inline-end" />
              ) : (
                <ArrowDownWideNarrow data-icon="inline-end" />
              )
            ) : null}
          </Button>
        </ButtonGroup>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:balance]">
        {sortedUniverses.map((universe) => {
          const skinlineIds = parseSkinlineIds(universe.lolSkinlineIdSets);
          const linkedSkinlines = skinlineIds.map((id) => skinlineMap.get(id)).filter((sl): sl is Skinline => sl !== undefined);

          return (
            <Card key={universe.lolUniverseId} className="break-inside-avoid mb-4 overflow-hidden">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-lg">
                  <Link href={universePath(universe)} className="inline-flex items-center gap-2 hover:underline">
                    <UniverseIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    {universe.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {linkedSkinlines.length > 0 ? (
                  <Tree>
                    {linkedSkinlines.map((sl) => (
                      <TreeFile
                        key={sl.riotSkinlineId}
                        icon={SkinlineIcon}
                        className="text-base"
                        name={
                          <Link href={skinlinePath(sl)} className="hover:underline">
                            {sl.name}
                          </Link>
                        }
                      />
                    ))}
                  </Tree>
                ) : (
                  <p className="text-xs text-muted-foreground">暂无关联系列</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

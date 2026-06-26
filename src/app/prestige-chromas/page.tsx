import type { Metadata } from "next";

import { HomeContent } from "@/components/home/home-content";
import { parsePrestigeChromaListOptions } from "@/lib/lol/prestige-chroma";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "臻彩皮肤 - Skin Hub",
  description:
    "浏览英雄联盟国服臻彩皮肤，查看臻彩英雄、分类、上线时间与独立详情页。",
  openGraph: {
    title: "臻彩皮肤 - Skin Hub",
    description:
      "浏览英雄联盟国服臻彩皮肤，查看臻彩英雄、分类、上线时间与独立详情页。",
  },
};

export default async function PrestigeChromasPage({
  searchParams,
}: {
  searchParams?: Promise<{
    group?: string | string[];
    sort?: string | string[];
    order?: string | string[];
    category?: string | string[];
  }>;
}) {
  return (
    <HomeContent
      activeTab="prestige-chromas"
      prestigeChromaOptions={parsePrestigeChromaListOptions(await searchParams)}
    />
  );
}

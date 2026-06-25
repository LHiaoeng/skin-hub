import type { MetadataRoute } from "next";

import {
  getPrestigeChromas,
  getSkinlines,
  getSkins,
  getUniverses,
} from "@/lib/api/backend-client";
import {
  prestigeChromaPath,
  skinlinePath,
  skinPath,
  universePath,
} from "@/lib/routing/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [skins, skinlines, universes, prestigeChromas] = await Promise.all([
    getSkins({ size: 100 }),
    getSkinlines(),
    getUniverses(),
    getPrestigeChromasForSitemap(),
  ]);

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...skins.map((skin) => ({
      url: `${siteUrl}${skinPath(skin)}`,
      lastModified: skin.releaseTime ? new Date(skin.releaseTime) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...prestigeChromas.map((item) => ({
      url: `${siteUrl}${prestigeChromaPath(item)}`,
      lastModified: toSitemapDate(item.startDate ?? item.startTime),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...skinlines.map((skinline) => ({
      url: `${siteUrl}${skinlinePath(skinline)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...universes.map((universe) => ({
      url: `${siteUrl}${universePath(universe)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

async function getPrestigeChromasForSitemap() {
  try {
    return await getPrestigeChromas();
  } catch (error) {
    console.error("[sitemap] Failed to load prestige chromas.", error);
    return [];
  }
}

function toSitemapDate(value: string | undefined): Date {
  if (!value?.trim()) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

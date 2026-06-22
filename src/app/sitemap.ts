import type { MetadataRoute } from "next";

import { getSkinlines, getSkins, getUniverses } from "@/lib/api/backend-client";
import { skinlinePath, skinPath, universePath } from "@/lib/routing/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [skins, skinlines, universes] = await Promise.all([getSkins({ size: 100 }), getSkinlines(), getUniverses()]);

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

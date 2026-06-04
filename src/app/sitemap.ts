import type { MetadataRoute } from "next";

import { getSkins } from "@/lib/api/backend-client";
import { skinPath } from "@/lib/routing/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const skins = await getSkins({ size: 100 });

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
  ];
}

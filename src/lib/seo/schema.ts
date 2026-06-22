import type { Skin } from "@/types/lol";

export function websiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Skin Hub",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/skins?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function skinImageSchema(skin: Skin, imageUrl: string | undefined, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: `${skin.name} 皮肤原画`,
    contentUrl: imageUrl,
    url: pageUrl,
    description: skin.description ?? `${skin.name} 的 LOL 皮肤详情、稀有度、系列和上线时间。`,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function collectionPageSchema({
  name,
  description,
  url,
  imageUrl,
  items,
}: {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    primaryImageOfPage: imageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

const COMMUNITY_DRAGON_DOMAIN = "https://communitydragon.breadj.com/";
type CommunityDragonVersion = "latest" | "pbe";
type CommunityDragonLang = "default" | "zh_cn";

function joinUrl(domain: string, path: string) {
  return `${domain.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function hasUrlProtocol(url: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(url);
}

function resolveVersion(isPbeOnly?: number | boolean): CommunityDragonVersion {
  return isPbeOnly === true || isPbeOnly === 1 ? "pbe" : "latest";
}

function withCommunityDragonLang(path: string, lang: CommunityDragonLang) {
  if (lang === "zh_cn" && path.includes("/v1/emblem-images/")) {
    return path.replace("/global/default/", "/global/zh_cn/");
  }

  return path;
}

function normalizeCommunityDragonPath(path: string) {
  const resourcePath = path.replace(/^\/+/, "");

  if (!resourcePath.toLowerCase().startsWith("lol-game-data/assets/")) {
    return resourcePath;
  }

  const assetPath = resourcePath.slice("lol-game-data/assets/".length).replace(/^ASSETS\//, "assets/");
  return `plugins/rcp-be-lol-game-data/global/default/${assetPath}`;
}

function withCommunityDragonVersion(path: string, version: CommunityDragonVersion, lang: CommunityDragonLang) {
  const resourcePath = withCommunityDragonLang(normalizeCommunityDragonPath(path), lang);
  if (resourcePath.startsWith("pbe/") || resourcePath.startsWith("latest/")) {
    return resourcePath;
  }

  return `${version}/${resourcePath}`;
}

export function resolveResourceUrl(url: string | undefined, isPbeOnly?: number | boolean, lang: CommunityDragonLang = "default"): string {
  const rawUrl = url?.trim();
  if (!rawUrl) {
    return "";
  }

  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  if (hasUrlProtocol(rawUrl) || rawUrl.startsWith("./") || rawUrl.startsWith("../")) {
    return rawUrl;
  }

  const resourcePath = rawUrl.replace(/\\/g, "/").replace(/^\/+/, "");
  return joinUrl(COMMUNITY_DRAGON_DOMAIN, withCommunityDragonVersion(resourcePath, resolveVersion(isPbeOnly), lang));
}

export function normalizeImageUrl(path: string | undefined, isPbeOnly?: number | boolean, lang: CommunityDragonLang = "default"): string | undefined {
  return resolveResourceUrl(path, isPbeOnly, lang) || undefined;
}

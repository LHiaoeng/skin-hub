const COMMUNITY_DRAGON_DOMAIN = "https://communitydragon.breadj.com/";
type CommunityDragonVersion = "latest" | "pbe";

function joinUrl(domain: string, path: string) {
  return `${domain.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function hasUrlProtocol(url: string) {
  return /^[a-z][a-z\d+\-.]*:/i.test(url);
}

function resolveVersion(isPbeOnly?: number | boolean): CommunityDragonVersion {
  return isPbeOnly === true || isPbeOnly === 1 ? "pbe" : "latest";
}

function withCommunityDragonVersion(path: string, version: CommunityDragonVersion) {
  const resourcePath = path.replace(/^\/+/, "");
  if (resourcePath.startsWith("pbe/") || resourcePath.startsWith("latest/")) {
    return resourcePath;
  }

  return `${version}/${resourcePath}`;
}

export function resolveResourceUrl(url: string | undefined, isPbeOnly?: number | boolean): string {
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
  return joinUrl(COMMUNITY_DRAGON_DOMAIN, withCommunityDragonVersion(resourcePath, resolveVersion(isPbeOnly)));
}

export function normalizeImageUrl(path: string | undefined, isPbeOnly?: number | boolean): string | undefined {
  return resolveResourceUrl(path, isPbeOnly) || undefined;
}

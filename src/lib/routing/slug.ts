const slugPattern = /[^a-z0-9]+/g;

export function toSlug(value: string | number | undefined): string {
  if (value === undefined) {
    return "unknown";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(slugPattern, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "unknown";
}

export function skinPath(skin: { riotSkinId: number; nameEng?: string; name: string }): string {
  return `/skins/${skin.riotSkinId}-${toSlug(skin.nameEng ?? skin.name)}`;
}

export function championPath(champion: { heroId: number; nameEng?: string; name: string }): string {
  return `/champions/${champion.heroId}-${toSlug(champion.nameEng ?? champion.name)}`;
}

export function parseRouteId(value: string): number {
  const [id] = value.split("-");
  return Number(id);
}

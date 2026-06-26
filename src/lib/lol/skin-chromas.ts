import type { Skin, SkinChroma } from "@/types/lol";

type UnknownRecord = Record<string, unknown>;

export function parseSkinChromas(skin: Skin): SkinChroma[] {
  const chromasById = new Map<number, SkinChroma>();
  const raw = skin.chromasJson?.trim();

  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      const items = Array.isArray(parsed)
        ? parsed
        : isRecord(parsed) && Array.isArray(parsed.chromas)
          ? parsed.chromas
          : [];
      items
        .map(normalizeChroma)
        .filter((item): item is SkinChroma => item !== undefined)
        .forEach((chroma) => chromasById.set(chroma.id, chroma));
    } catch {
      // The structured chroma list remains authoritative when the legacy JSON is invalid.
    }
  }

  skin.chromas?.forEach((chroma) => chromasById.set(chroma.id, chroma));

  return Array.from(chromasById.values());
}

function normalizeChroma(value: unknown): SkinChroma | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = numberOf(value.id);
  const name = stringOf(value.name);

  if (id === undefined || !name) {
    return undefined;
  }

  return {
    id,
    name,
    contentId: stringOf(value.contentId),
    chromaPath: stringOf(value.chromaPath),
    tilePath: stringOf(value.tilePath),
    splashPath: stringOf(value.splashPath),
    uncenteredSplashPath: stringOf(value.uncenteredSplashPath),
    loadScreenPath: stringOf(value.loadScreenPath),
    loadScreenVintagePath: stringOf(value.loadScreenVintagePath),
    splashVideoPath: stringOf(value.splashVideoPath),
    previewVideoUrl: stringOf(value.previewVideoUrl),
    collectionSplashVideoPath: stringOf(value.collectionSplashVideoPath),
    colors: stringArrayOf(value.colors),
    description: stringOf(value.description),
  };
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringOf(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberOf(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function stringArrayOf(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

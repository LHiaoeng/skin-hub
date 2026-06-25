import { getEmblemDisplayItems } from "@/lib/lol/rarity";
import type { SkinDictItem } from "@/types/lol";

export function SkinEmblems({
  className,
  dictItems,
  emblemNames,
  isPbeOnly,
  scalePercent,
}: {
  className?: string;
  dictItems: SkinDictItem[];
  emblemNames?: string;
  isPbeOnly?: number | boolean;
  scalePercent?: number;
}) {
  const emblems = getEmblemDisplayItems(dictItems, emblemNames, isPbeOnly);

  if (!emblems.length) {
    return null;
  }

  return (
    <span className={className}>
      {emblems.map((emblem) =>
        emblem.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Emblem assets should render at their original dimensions by default.
          <img
            src={emblem.iconUrl}
            alt={emblem.name}
            key={emblem.value}
            style={
              scalePercent === undefined
                ? undefined
                : ({
                    "--emblem-scale": String(scalePercent / 100),
                  } as React.CSSProperties)
            }
            title={emblem.name}
          />
        ) : null,
      )}
    </span>
  );
}

import Image from "next/image";

import { getCnRarityIconUrl, getCnRarityName } from "@/lib/lol/rarity";
import type { SkinDictItem } from "@/types/lol";

import styles from "./rarity-badge.module.css";

export function RarityBadge({
  regionRarityId,
  rarityGemPath,
  isPbeOnly,
  dictItems,
}: {
  regionRarityId?: number | string;
  rarityGemPath?: string;
  isPbeOnly?: number | boolean;
  dictItems?: SkinDictItem[];
}) {
  const label = getCnRarityName(regionRarityId, dictItems);
  const iconUrl = getCnRarityIconUrl(
    regionRarityId,
    rarityGemPath,
    isPbeOnly,
    dictItems,
  );

  if (!iconUrl) {
    return null;
  }

  return (
    <span
      className={styles.badge}
      title={label}
      aria-label={`国服稀有度：${label}`}
    >
      <Image
        className={styles.icon}
        src={iconUrl}
        alt=""
        width={24}
        height={24}
        aria-hidden="true"
      />
    </span>
  );
}

import Image from "next/image";
import Link from "next/link";

import { normalizeImageUrl } from "@/lib/images/cdn";
import { skinPath } from "@/lib/routing/slug";
import type { Skin } from "@/types/lol";

export function SkinCard({ skin, priority = false }: { skin: Skin; priority?: boolean }) {
  const imageUrl = normalizeImageUrl(skin.splashPath ?? skin.loadScreenPath ?? skin.tilePath, skin.isPbeOnly);

  return (
    <Link className="skin-card" href={skinPath(skin)} aria-label={`查看 ${skin.name} 详情`}>
      <div className="skin-card__image">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${skin.championName ?? ""} ${skin.name} 皮肤原画`.trim()}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="image-placeholder">No image</div>
        )}
      </div>
      <div className="skin-card__body">
        <span className="eyebrow">{skin.championName ?? `英雄 ${skin.championId}`}</span>
        <h3>{skin.name}</h3>
        <p>{skin.description ?? skin.nameEng ?? "查看皮肤原画、稀有度、系列和上线时间。"}</p>
        <div className="meta-row">
          {skin.rarity ? <span>{skin.rarity}</span> : null}
          {skin.releaseTime ? <span>{skin.releaseTime}</span> : null}
        </div>
      </div>
    </Link>
  );
}

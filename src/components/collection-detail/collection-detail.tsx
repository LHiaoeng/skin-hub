import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Home, type LucideIcon } from "lucide-react";

import { RarityBadge } from "@/components/home/rarity-badge";
import { SkinEmblems } from "@/components/skin/skin-emblems";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { CopyButton } from "@/components/ui/copy-button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { nextSkinSortOrder, type SkinSort, type SkinSortField } from "@/lib/lol/skin-sort";
import { getContentSection, type ContentSectionKey } from "@/lib/navigation/content-sections";
import { skinPath } from "@/lib/routing/slug";
import type { Skin, SkinDictItem } from "@/types/lol";

import { CollectionBackground } from "./collection-background";
import styles from "./collection-detail.module.css";

export interface DetailBreadcrumb {
  label: string;
  href?: string;
  sectionKey?: ContentSectionKey;
  copyable?: boolean;
}

export function CollectionDetailLayout({
  backgroundUrls,
  breadcrumbs,
  title,
  englishName,
  englishDescription,
  description,
  descriptionPlaceholder,
  heroMeta,
  children,
}: {
  backgroundUrls?: string[];
  breadcrumbs: DetailBreadcrumb[];
  title: string;
  englishName?: string;
  englishDescription?: string;
  description?: string;
  descriptionPlaceholder?: string;
  heroMeta?: React.ReactNode;
  children: React.ReactNode;
}) {
  const visibleDescription = description ?? descriptionPlaceholder;

  return (
    <main className={styles.shell}>
      {backgroundUrls?.length ? <CollectionBackground sources={backgroundUrls} /> : null}
      <div className={styles.scrim} />
      <article className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="面包屑">
          {breadcrumbs.map((item, index) => (
            <span className={styles.breadcrumbItem} key={`${item.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href ? (
                <Link href={item.href}>
                  {item.href === "/" ? <Home aria-hidden="true" className={styles.navigationIcon} /> : null}
                  {item.sectionKey ? <ContentSectionIcon sectionKey={item.sectionKey} /> : null}
                  {item.label}
                </Link>
              ) : (
                <span className={styles.currentBreadcrumb}>
                  {item.sectionKey ? <ContentSectionIcon sectionKey={item.sectionKey} /> : null}
                  {item.label}
                  {item.copyable ? <CopyButton className={styles.breadcrumbCopyButton} value={item.label} /> : null}
                </span>
              )}
            </span>
          ))}
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>{title}</h1>
            {englishName ? (
              englishDescription ? (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <p className={`${styles.englishName} ${styles.hoverCardTrigger}`}>
                      <span>{englishName}</span>
                      <CopyButton className={styles.actionButton} value={englishName} />
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className={styles.englishHoverCard}>
                    <strong>{englishName}</strong>
                    <p>{englishDescription}</p>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <p className={styles.englishName}>
                  <span>{englishName}</span>
                  <CopyButton className={styles.actionButton} value={englishName} />
                </p>
              )
            ) : null}
            {visibleDescription ? (
              <p className={styles.description}>
                {visibleDescription}
                <CopyButton className={styles.actionButton} value={visibleDescription} />
              </p>
            ) : null}
            {heroMeta ? <div className={styles.heroMeta}>{heroMeta}</div> : null}
          </div>
        </section>

        <div className={styles.divider} />
        {children}
      </article>
    </main>
  );
}

function ContentSectionIcon({ sectionKey }: { sectionKey: ContentSectionKey }) {
  const Icon = getContentSection(sectionKey).icon;
  return <Icon aria-hidden="true" className={styles.navigationIcon} />;
}

export function SkinSortToolbar({
  basePath,
  activeSort,
  totalLabel,
}: {
  basePath: string;
  activeSort: SkinSort;
  totalLabel: React.ReactNode;
}) {
  return (
    <div className={styles.toolbar}>
      <ButtonGroup className={styles.sortLinks} aria-label="皮肤排序">
        <SkinSortLink basePath={basePath} field="release" activeSort={activeSort}>
          发布时间
        </SkinSortLink>
        <SkinSortLink basePath={basePath} field="rarity" activeSort={activeSort}>
          皮肤品质
        </SkinSortLink>
      </ButtonGroup>
      <span>{totalLabel}</span>
    </div>
  );
}

export function SkinGrid({
  skins,
  emblemDictItems,
  rarityDictItems,
  label,
}: {
  skins: Skin[];
  emblemDictItems: SkinDictItem[];
  rarityDictItems: SkinDictItem[];
  label: string;
}) {
  return (
    <div className={styles.skinList} aria-label={label}>
      {skins.map((skin, index) => (
        <SkinTile
          skin={skin}
          key={skin.riotSkinId}
          priority={index < 4}
          emblemDictItems={emblemDictItems}
          rarityDictItems={rarityDictItems}
        />
      ))}
    </div>
  );
}

export function CollectionSection({
  title,
  href,
  icon: Icon,
  children,
}: {
  title: string;
  href?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  const titleContent = (
    <>
      {Icon ? <Icon aria-hidden="true" className={styles.collectionSectionIcon} /> : null}
      {title}
    </>
  );

  return (
    <section className={styles.collectionSection}>
      <h2>{href ? <Link href={href}>{titleContent}</Link> : titleContent}</h2>
      {children}
    </section>
  );
}

export function EmptyCollection({ children }: { children: React.ReactNode }) {
  return <section className={styles.empty}>{children}</section>;
}

export function MetaTag({ children }: { children: React.ReactNode }) {
  return <span className={styles.tag}>{children}</span>;
}

export function InlineCopyButton({ value, label }: { value: string | number; label: string }) {
  return <CopyButton className={styles.actionButton} value={value} label={label} />;
}

function SkinTile({
  skin,
  priority,
  emblemDictItems,
  rarityDictItems,
}: {
  skin: Skin;
  priority: boolean;
  emblemDictItems: SkinDictItem[];
  rarityDictItems: SkinDictItem[];
}) {
  const imageUrl = normalizeImageUrl(skin.tilePath ?? skin.loadScreenPath ?? skin.splashPath, skin.isPbeOnly);

  return (
    <Link className={styles.skinItem} href={skinPath(skin)} title={skin.name}>
      <span className={styles.skinThumb}>
        {imageUrl ? (
          <Image src={imageUrl} alt={`${skin.name} 皮肤卡片图`} fill priority={priority} sizes="(max-width: 520px) 46vw, 280px" />
        ) : (
          <span className={styles.imagePlaceholder}>暂无图片</span>
        )}
        <SkinEmblems
          className={styles.emblems}
          dictItems={emblemDictItems}
          emblemNames={skin.emblemNames}
          isPbeOnly={skin.isPbeOnly}
        />
      </span>
      <span className={styles.skinName}>
        <RarityBadge
          regionRarityId={skin.regionRarityId}
          rarityGemPath={skin.rarityGemPath}
          isPbeOnly={skin.isPbeOnly}
          dictItems={rarityDictItems}
        />
        <strong title={skin.name}>{skin.name}</strong>
      </span>
    </Link>
  );
}

function SkinSortLink({
  basePath,
  field,
  activeSort,
  children,
}: {
  basePath: string;
  field: SkinSortField;
  activeSort: SkinSort;
  children: React.ReactNode;
}) {
  const nextOrder = nextSkinSortOrder(field, activeSort);
  const href = field === "release" && nextOrder === "asc" ? basePath : `${basePath}?sort=${field}&order=${nextOrder}`;
  const active = field === activeSort.field;

  return (
    <Button asChild className={`${styles.actionButton} ${styles.sortButton} ${active ? styles.active : ""}`} variant="outline">
      <Link href={href}>
        {children}
        {active ? activeSort.order === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" /> : null}
      </Link>
    </Button>
  );
}

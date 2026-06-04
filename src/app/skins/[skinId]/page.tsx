import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getSkin, getSkins } from "@/lib/api/backend-client";
import { normalizeImageUrl } from "@/lib/images/cdn";
import { parseRouteId, skinPath } from "@/lib/routing/slug";
import { breadcrumbSchema, skinImageSchema } from "@/lib/seo/schema";

interface SkinDetailPageProps {
  params: Promise<{
    skinId: string;
  }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const skins = await getSkins({ size: 24 });
  return skins.map((skin) => ({
    skinId: skinPath(skin).replace("/skins/", ""),
  }));
}

export async function generateMetadata({ params }: SkinDetailPageProps): Promise<Metadata> {
  const { skinId } = await params;
  const skin = await getSkin(parseRouteId(skinId));

  if (!skin) {
    return {
      title: "皮肤未找到",
    };
  }

  const imageUrl = normalizeImageUrl(skin.splashPath ?? skin.loadScreenPath, skin.isPbeOnly);
  const description = skin.description ?? `${skin.name} 的皮肤原画、英雄、稀有度、系列和上线时间。`;

  return {
    title: `${skin.name} 皮肤详情`,
    description,
    alternates: {
      canonical: skinPath(skin),
    },
    openGraph: {
      title: `${skin.name} 皮肤详情`,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: `${skin.name} 皮肤原画` }] : undefined,
    },
  };
}

export default async function SkinDetailPage({ params }: SkinDetailPageProps) {
  const { skinId } = await params;
  const skin = await getSkin(parseRouteId(skinId));

  if (!skin) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${siteUrl}${skinPath(skin)}`;
  const splashUrl = normalizeImageUrl(skin.splashPath ?? skin.uncenteredSplashPath, skin.isPbeOnly);
  const loadScreenUrl = normalizeImageUrl(skin.loadScreenPath ?? skin.tilePath, skin.isPbeOnly);
  const skinlines = skin.skinlineNames ?? skin.skinlineIdSets?.split(",").filter(Boolean) ?? [];

  return (
    <main>
      <JsonLd data={skinImageSchema(skin, splashUrl, pageUrl)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "首页", url: siteUrl },
          { name: "皮肤", url: `${siteUrl}/skins` },
          { name: skin.name, url: pageUrl },
        ])}
      />

      <article className="detail">
        <nav className="breadcrumb" aria-label="面包屑">
          <Link href="/">首页</Link>
          <span>/</span>
          <span>{skin.name}</span>
        </nav>

        <section className="detail-hero">
          <div className="detail-hero__copy">
            <p className="eyebrow">{skin.championName ?? `英雄 ${skin.championId}`}</p>
            <h1>{skin.name}</h1>
            <p>{skin.description ?? `${skin.name} 的 LOL 皮肤详情，包含原画、稀有度、系列和上线时间。`}</p>
            <div className="tag-row">
              {skin.rarity ? <span>{skin.rarity}</span> : null}
              {skin.isLegacy ? <span>限定</span> : null}
              {skin.isPbeOnly ? <span>PBE</span> : null}
              {skin.releaseTime ? <span>上线：{skin.releaseTime}</span> : null}
            </div>
          </div>
          <div className="detail-hero__image">
            {splashUrl ? (
              <Image
                src={splashUrl}
                alt={`${skin.championName ?? ""} ${skin.name} 皮肤原画`.trim()}
                fill
                priority
                sizes="100vw"
              />
            ) : (
              <div className="image-placeholder">No splash image</div>
            )}
          </div>
        </section>

        <section className="detail-grid">
          <div className="info-card">
            <h2>基础信息</h2>
            <dl>
              <div>
                <dt>皮肤 ID</dt>
                <dd>{skin.riotSkinId}</dd>
              </div>
              <div>
                <dt>英雄 ID</dt>
                <dd>{skin.championId}</dd>
              </div>
              <div>
                <dt>英文名</dt>
                <dd>{skin.nameEng ?? "未提供"}</dd>
              </div>
              <div>
                <dt>稀有度</dt>
                <dd>{skin.rarity ?? "未提供"}</dd>
              </div>
            </dl>
          </div>

          <div className="info-card">
            <h2>所属系列</h2>
            {skinlines.length > 0 ? (
              <div className="tag-row">
                {skinlines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            ) : (
              <p>后端暂未返回系列信息。</p>
            )}
          </div>

          <div className="info-card preview-card">
            <h2>加载图 / 缩略图</h2>
            <div className="preview-image">
              {loadScreenUrl ? (
                <Image src={loadScreenUrl} alt={`${skin.name} 加载图`} fill sizes="(max-width: 768px) 100vw, 360px" />
              ) : (
                <div className="image-placeholder">No preview image</div>
              )}
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

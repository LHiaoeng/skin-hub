import type { Metadata } from "next";

import { SkinCard } from "@/components/skin/skin-card";
import { getSkins } from "@/lib/api/backend-client";

interface SkinsPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "皮肤检索",
  description: "按皮肤、英雄或系列关键词检索 LOL 国服皮肤。",
};

export default async function SkinsPage({ searchParams }: SkinsPageProps) {
  const { q } = await searchParams;
  const keyword = q?.trim();
  const skins = await getSkins({ size: 48, keyword });

  return (
    <main>
      <section className="section">
        <div className="section__heading">
          <p className="eyebrow">Skin Search</p>
          <h1>皮肤检索</h1>
          <p>
            检索请求直接透传到后端真实接口的 `keyword`
            参数，页面只渲染接口返回结果。
          </p>
        </div>
        <form
          className="search-box search-box--section"
          action="/skins"
          role="search"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索皮肤、英雄或系列"
            aria-label="搜索皮肤、英雄或系列"
          />
          <button type="submit">搜索</button>
        </form>
        <div className="result-count">共 {skins.length} 个结果</div>
        {skins.length > 0 ? (
          <div className="skin-grid">
            {skins.map((skin, index) => (
              <SkinCard
                key={skin.riotSkinId}
                skin={skin}
                priority={index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">真实接口暂未返回匹配数据。</div>
        )}
      </section>
    </main>
  );
}

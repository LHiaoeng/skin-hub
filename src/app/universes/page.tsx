import { Metadata } from "next";

import { HomeContent } from "@/components/home/home-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "皮肤宇宙 - Skin Hub",
  description: "浏览英雄联盟全部皮肤宇宙，了解每个宇宙包含的皮肤系列与关联内容。",
  openGraph: {
    title: "皮肤宇宙 - Skin Hub",
    description: "浏览英雄联盟全部皮肤宇宙，了解每个宇宙包含的皮肤系列与关联内容。",
  },
};

export default async function UniversesPage() {
  return <HomeContent activeTab="universes" />;
}

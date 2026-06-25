import { HomeContent } from "@/components/home/home-content";
import { parseSkinlineSort } from "@/lib/lol/skinline-sort";

export const revalidate = 3600;

export default async function SkinlinesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    sort?: string | string[];
    order?: string | string[];
  }>;
}) {
  return (
    <HomeContent
      activeTab="skinlines"
      skinlineSort={parseSkinlineSort(await searchParams)}
    />
  );
}

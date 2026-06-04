import { HomeContent } from "@/components/home/home-content";

export const revalidate = 3600;

export default async function ChampionsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    role?: string | string[];
    position?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <HomeContent
      activeTab="champions"
      championBasePath="/champions"
      selectedPosition={getFirstSearchParam(resolvedSearchParams?.position)}
      selectedRole={getFirstSearchParam(resolvedSearchParams?.role)}
    />
  );
}

function getFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

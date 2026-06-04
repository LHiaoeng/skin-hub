import { HomeContent } from "@/components/home/home-content";

export const revalidate = 3600;

export default async function ComingPage() {
  return <HomeContent activeTab="coming" />;
}

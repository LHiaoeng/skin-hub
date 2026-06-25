import {
  Globe,
  Orbit,
  Palette,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";

export type ContentSectionKey =
  | "champions"
  | "universes"
  | "skinlines"
  | "prestige-chromas"
  | "coming";

export interface ContentSection {
  key: ContentSectionKey;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const contentSections: ContentSection[] = [
  { key: "champions", label: "英雄", href: "/champions", icon: User },
  { key: "universes", label: "皮肤宇宙", href: "/universes", icon: Orbit },
  { key: "skinlines", label: "皮肤套装", href: "/skinlines", icon: Globe },
  {
    key: "prestige-chromas",
    label: "臻彩原画",
    href: "/prestige-chromas",
    icon: Palette,
  },
  { key: "coming", label: "后续内容", href: "/coming", icon: Sparkles },
];

export function getContentSection(key: ContentSectionKey): ContentSection {
  const section = contentSections.find((item) => item.key === key);
  if (!section) throw new Error(`Unknown content section: ${key}`);
  return section;
}

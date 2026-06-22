import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import Script from "next/script";

import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "@/styles/globals.css";

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Skin Hub - 国服 LOL 皮肤资料库",
    template: "%s | Skin Hub",
  },
  description: "聚合国服 LOL 皮肤、英雄、皮肤宇宙和皮肤套装信息的轻量资料站。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("theme")||"dark";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){document.documentElement.classList.add("dark")}})()`}
        </Script>
      </head>
      <body className={notoSans.className}>
        <ThemeProvider>
          <SiteHeader />
          {children}
          <footer className="mx-auto grid w-full max-w-7xl gap-3 border-t border-border px-4 py-8 text-sm text-muted-foreground sm:grid-cols-[auto_1fr] sm:px-6 lg:px-8">
            <strong className="text-foreground">Skin Hub</strong>
            <span>
              本项目主要展示国服 LOL 公开信息，仅用于资料检索与学习展示；游戏素材版权归 Riot Games 与腾讯游戏相关权利方所有。
            </span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

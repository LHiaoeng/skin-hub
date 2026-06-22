import { Settings } from "lucide-react";
import Link from "next/link";

import { HeaderBackButton } from "@/components/layout/header-back-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <HeaderBackButton />
          <Link className="shrink-0 text-lg font-black uppercase tracking-[0.16em]" href="/" aria-label="Skin Hub 首页">
            Skin Hub
          </Link>
          <form className="grid w-full max-w-xl grid-cols-[1fr_auto] gap-2" action="/skins" role="search">
            <Input name="q" placeholder="搜索国服皮肤、英雄、套装" aria-label="搜索国服皮肤、英雄、套装" />
            <Button type="submit" size="sm">
              搜索
            </Button>
          </form>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70 transition-colors hover:bg-accent hover:text-accent-foreground"
            href="/settings"
            aria-label="系统设置"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

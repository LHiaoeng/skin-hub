import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "系统设置",
  description: "Skin Hub 系统设置入口。",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/10">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[hsl(var(--accent-strong))]">
          Settings
        </p>
        <h1 className="text-2xl font-black tracking-tight">系统设置</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          一期先保留设置入口。后续可接入数据源、图片源、主题偏好和显示密度配置。
        </p>
      </section>
    </main>
  );
}

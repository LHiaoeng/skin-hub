"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const label = theme === "system" ? "系统" : resolvedTheme === "dark" ? "暗色" : "亮色";

  function cycleTheme() {
    if (theme === "dark") {
      setTheme("light");
      return;
    }

    if (theme === "light") {
      setTheme("system");
      return;
    }

    setTheme("dark");
  }

  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      onClick={cycleTheme}
      aria-label={`切换明暗模式，当前：${mounted ? label : "暗色"}`}
      title={`当前：${mounted ? label : "暗色"}`}
    >
      {!mounted ? <Moon className="h-4 w-4" aria-hidden="true" /> : null}
      {mounted && theme === "system" ? <Monitor className="h-4 w-4" aria-hidden="true" /> : null}
      {mounted && theme !== "system" && resolvedTheme === "dark" ? <Moon className="h-4 w-4" aria-hidden="true" /> : null}
      {mounted && theme !== "system" && resolvedTheme === "light" ? <Sun className="h-4 w-4" aria-hidden="true" /> : null}
    </Button>
  );
}

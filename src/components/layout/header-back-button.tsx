"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function HeaderBackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <Button type="button" variant="ghost" size="icon" onClick={handleBack} aria-label="返回上一页">
      <ArrowLeft aria-hidden="true" />
    </Button>
  );
}

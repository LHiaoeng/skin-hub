"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CopyButton({ className, value }: { className?: string; value: string | number | undefined }) {
  const [copied, setCopied] = useState(false);

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const handleCopy = () => {
    copyText(String(value));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Button
      className={className}
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={handleCopy}
      title={copied ? "复制成功" : "复制"}
      aria-label={copied ? "复制成功" : "复制"}
    >
      {copied ? <Check aria-hidden="true" data-icon="inline-end" /> : <Copy aria-hidden="true" data-icon="inline-end" />}
    </Button>
  );
}

function copyText(value: string) {
  const copied = copyWithTextarea(value);
  void navigator.clipboard?.writeText(value).catch(() => {
    if (!copied) {
      copyWithTextarea(value);
    }
  });
}

function copyWithTextarea(value: string) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

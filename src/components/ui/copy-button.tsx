"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value }: { value: string | number | undefined }) {
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
    <button type="button" onClick={handleCopy} title={copied ? "复制成功" : "复制"} aria-label={copied ? "复制成功" : "复制"}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
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

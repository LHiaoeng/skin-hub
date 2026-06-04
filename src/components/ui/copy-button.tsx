"use client";

export function CopyButton({ value }: { value: string | number | undefined }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <button type="button" onClick={() => navigator.clipboard.writeText(String(value))}>
      复制
    </button>
  );
}

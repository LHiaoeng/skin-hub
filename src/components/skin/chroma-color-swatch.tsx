"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import styles from "./chroma-color-swatch.module.css";

const DEFAULT_SIZE = 16;

export function ChromaColorSwatch({
  className,
  colors,
  interactive = true,
  label = "炫彩颜色",
  onOpenChange,
  size = DEFAULT_SIZE,
  stopPropagation = true,
}: {
  className?: string;
  colors: string[];
  interactive?: boolean;
  label?: string;
  onOpenChange?: (isOpen: boolean) => void;
  size?: number;
  stopPropagation?: boolean;
}) {
  const normalizedColors = normalizeColors(colors);
  const hasColors = normalizedColors.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function setPopoverOpen(nextOpen: boolean) {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function openPopover() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setPopoverOpen(true);
  }

  function scheduleClose() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => setPopoverOpen(false), 120);
  }

  if (!hasColors) {
    return (
      <span
        className={[styles.trigger, className].filter(Boolean).join(" ")}
        title={label}
        aria-label={label}
        role="img"
        onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Empty chroma color is a generated SVG image data URL. */}
        <img
          className={styles.swatch}
          src={buildEmptyChromaSwatchDataUrl()}
          alt=""
          height={size}
          style={{ "--chroma-swatch-size": `${size}px` } as React.CSSProperties}
          width={size}
        />
      </span>
    );
  }

  if (!interactive) {
    return (
      <span
        className={[styles.trigger, className].filter(Boolean).join(" ")}
        title={label}
        aria-label={label}
        role="img"
        onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Chroma colors are generated SVG image data URLs. */}
        <img
          className={styles.swatch}
          src={buildChromaSwatchDataUrl(normalizedColors)}
          alt=""
          height={size}
          style={{ "--chroma-swatch-size": `${size}px` } as React.CSSProperties}
          width={size}
        />
      </span>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className={[styles.trigger, className].filter(Boolean).join(" ")}
          type="button"
          aria-label={label}
          title={label}
          onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
          onMouseEnter={openPopover}
          onMouseLeave={scheduleClose}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Chroma colors are generated SVG image data URLs. */}
          <img
            className={styles.swatch}
            src={buildChromaSwatchDataUrl(normalizedColors)}
            alt=""
            height={size}
            style={{ "--chroma-swatch-size": `${size}px` } as React.CSSProperties}
            width={size}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={styles.popoverContent}
        side="top"
        align="center"
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className={styles.colorList}>
          {normalizedColors.map((color) => (
            <ChromaColorValue color={color} key={color} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ChromaColorSwatches({
  className,
  swatches,
  size = DEFAULT_SIZE,
}: {
  className?: string;
  swatches: Array<{ colors: string[]; label?: string }>;
  size?: number;
}) {
  if (!swatches.length) {
    return null;
  }

  return (
    <span className={[styles.swatches, className].filter(Boolean).join(" ")}>
      {swatches.map((swatch, index) => (
        <ChromaColorSwatch
          colors={swatch.colors}
          key={`${swatch.label ?? "chroma"}-${swatch.colors.join("-")}-${index}`}
          label={swatch.label}
          size={size}
        />
      ))}
    </span>
  );
}

export function normalizeChromaColors(colors: string[]) {
  const seenColors = new Set<string>();
  const cleanColors: string[] = [];

  for (const color of colors) {
    const cleanColor = color.trim();
    const key = cleanColor.toLowerCase();

    if (!cleanColor || seenColors.has(key)) {
      continue;
    }

    seenColors.add(key);
    cleanColors.push(cleanColor);
  }

  return cleanColors;
}

const normalizeColors = normalizeChromaColors;

function buildChromaSwatchDataUrl(colors: string[]) {
  const fills = colors.length === 1 ? buildSingleFill(colors[0]) : buildMultiFill(colors);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${fills}<circle cx="50" cy="50" r="47" fill="none" stroke="#d7dce6" stroke-width="6"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildEmptyChromaSwatchDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" fill="#fffdf8"/><path d="M 24 76 L 76 24" fill="none" stroke="#c46f05" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="50" r="43" fill="none" stroke="#c46f05" stroke-width="6"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildSingleFill(color: string) {
  return `<circle cx="50" cy="50" r="47" fill="${escapeSvgAttribute(color)}"/>`;
}

function buildMultiFill(colors: string[]) {
  if (colors.length === 2) {
    return [
      `<clipPath id="chroma-swatch-clip"><circle cx="50" cy="50" r="47"/></clipPath>`,
      `<g clip-path="url(#chroma-swatch-clip)">`,
      `<polygon points="0,0 100,0 0,100" fill="${escapeSvgAttribute(colors[0])}"/>`,
      `<polygon points="100,0 100,100 0,100" fill="${escapeSvgAttribute(colors[1])}"/>`,
      `</g>`,
    ].join("");
  }

  const segmentAngle = 360 / colors.length;

  return colors
    .map((color, index) => {
      const startAngle = index * segmentAngle - 90;
      const endAngle = startAngle + segmentAngle;
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const start = polarToPoint(50, 50, 47, startAngle);
      const end = polarToPoint(50, 50, 47, endAngle);

      return `<path d="M 50 50 L ${start.x} ${start.y} A 47 47 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z" fill="${escapeSvgAttribute(color)}"/>`;
    })
    .join("");
}

function polarToPoint(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(3)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(3)),
  };
}

function escapeSvgAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ChromaColorValue({ color }: { color: string }) {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    copyText(color);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1400);
  }

  return (
    <button className={styles.colorValue} type="button" onClick={handleCopy} title="复制颜色值">
      <span style={{ backgroundColor: color }} />
      <code>{color}</code>
      {isCopied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
    </button>
  );
}

function copyText(value: string) {
  if (navigator.clipboard) {
    void navigator.clipboard.writeText(value).catch(() => {
      copyWithTextarea(value);
    });
    return;
  }

  copyWithTextarea(value);
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

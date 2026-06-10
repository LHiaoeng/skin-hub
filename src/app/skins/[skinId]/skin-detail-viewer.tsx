"use client";

import {
  ArrowLeft,
  ArrowRight,
  Box,
  Download,
  ExternalLink,
  Film,
  Info,
  Maximize2,
  Mic,
  Minimize2,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "@/app/skins/[skinId]/skin-detail-viewer.module.css";
import { ChromaColorSwatch, normalizeChromaColors } from "@/components/skin/chroma-color-swatch";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CopyButton } from "@/components/ui/copy-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SkinVisual {
  id: string;
  name: string;
  imageUrl?: string;
  focusImageUrl?: string;
  videoUrl?: string;
  focusVideoUrl?: string;
  thumbUrl?: string;
  colors: string[];
  description?: string;
}

export interface SkinPanelLink {
  label: string;
  href: string;
  meta?: string;
}

export interface SkinExternalLink {
  label: string;
  href: string;
  icon: "voice" | "video" | "model";
}

export interface SkinDetailIcon {
  name: string;
  iconUrl?: string;
  popoverIconUrl?: string;
}

export interface SkinDetailItem {
  label: string;
  value?: string;
  icons?: SkinDetailIcon[];
}

export interface SkinDetailViewerProps {
  skinName: string;
  description: string;
  championName: string;
  championHref?: string;
  rarityName: string;
  globalRarityName: string;
  rarityIconUrl?: string;
  tags: string[];
  basicDetails: SkinDetailItem[];
  cnDetails: SkinDetailItem[];
  globalDetails: SkinDetailItem[];
  skinlines: SkinPanelLink[];
  universes: SkinPanelLink[];
  externalLinks: SkinExternalLink[];
  prevSkin?: SkinPanelLink;
  nextSkin?: SkinPanelLink;
  visuals: SkinVisual[];
}

const VIEW_MODE_STORAGE_KEY = "skin-hub:skin-detail-view-mode";

export function SkinDetailViewer({
  skinName,
  description,
  championName,
  championHref,
  rarityName,
  globalRarityName,
  rarityIconUrl,
  basicDetails,
  cnDetails,
  globalDetails,
  skinlines,
  universes,
  externalLinks,
  prevSkin,
  nextSkin,
  visuals,
}: SkinDetailViewerProps) {
  const [selectedVisualId, setSelectedVisualId] = useState(visuals[0]?.id ?? "base");
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [viewMode, setViewMode] = useState<"focus" | "original">("focus");
  const [mediaMode, setMediaMode] = useState<"image" | "video">("image");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const baseVisual = visuals[0];
  const selectedVisual = visuals.find((visual) => visual.id === selectedVisualId) ?? visuals[0];
  const visualUrl = viewMode === "focus"
    ? selectedVisual?.focusImageUrl ?? selectedVisual?.imageUrl
    : selectedVisual?.imageUrl ?? selectedVisual?.focusImageUrl;
  const videoUrl = viewMode === "focus"
    ? selectedVisual?.focusVideoUrl ?? selectedVisual?.videoUrl
    : selectedVisual?.videoUrl ?? selectedVisual?.focusVideoUrl;
  const isShowingVideo = mediaMode === "video" && Boolean(videoUrl);
  const downloadUrl = isShowingVideo ? videoUrl : visualUrl;
  const backgroundImageUrl = viewMode === "focus"
    ? baseVisual?.focusImageUrl ?? baseVisual?.imageUrl
    : baseVisual?.imageUrl ?? baseVisual?.focusImageUrl;
  const backgroundVideoUrl = mediaMode === "video"
    ? viewMode === "focus"
      ? baseVisual?.focusVideoUrl ?? baseVisual?.videoUrl
      : baseVisual?.videoUrl ?? baseVisual?.focusVideoUrl
    : undefined;
  const canUseVideo = Boolean(videoUrl);
  const canUseFocusVisual = Boolean(
    (selectedVisual?.focusImageUrl || selectedVisual?.focusVideoUrl) && (selectedVisual?.imageUrl || selectedVisual?.videoUrl),
  );
  useEffect(() => {
    const savedMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (savedMode === "focus" || savedMode === "original") {
      const timeoutId = window.setTimeout(() => setViewMode(savedMode), 0);
      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, []);

  function toggleViewMode() {
    setViewMode((mode) => {
      const nextMode = mode === "focus" ? "original" : "focus";
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
      return nextMode;
    });
  }

  async function handleDownload() {
    if (!downloadUrl) {
      return;
    }

    const fileName = buildDownloadFileName(selectedVisual?.name ?? skinName, viewMode, isShowingVideo, downloadUrl);
    let objectUrl: string | undefined;

    try {
      const response = await fetch(downloadUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
    } catch {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    if (objectUrl !== downloadUrl) {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
  }

  return (
    <main className={styles.viewer} data-fit-mode={fitMode}>
      {backgroundVideoUrl ? (
        <video
          aria-hidden
          className={styles.backdropVideo}
          key={backgroundVideoUrl}
          muted
          autoPlay
          loop
          playsInline
          poster={backgroundImageUrl}
        >
          <source src={backgroundVideoUrl} />
        </video>
      ) : backgroundImageUrl ? (
        <div aria-hidden className={styles.backdrop} style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      ) : null}
      <div aria-hidden className={styles.shade} />

      <section className={styles.stage} aria-label={`${skinName} 原画查看`}>
        {mediaMode === "video" && videoUrl ? (
          <video
            className={styles.media}
            key={videoUrl}
            muted
            autoPlay
            loop
            playsInline
            poster={visualUrl}
          >
            <source src={videoUrl} />
          </video>
        ) : visualUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- The viewer switches remote skin assets client-side.
          <img
            className={styles.media}
            src={visualUrl}
            alt={selectedVisual?.name ?? skinName}
          />
        ) : (
          <div>暂无原画</div>
        )}
      </section>

      <div className={styles.topbar}>
        {championHref ? (
          <Link className={styles.heroLink} href={championHref} aria-label={`返回${championName}详情页`}>
            <ArrowLeft size={18} aria-hidden />
            <User size={18} aria-hidden />
            <span>{championName}</span>
          </Link>
        ) : (
          <span className={styles.heroLink}>
            <User size={18} aria-hidden />
            <span>{championName}</span>
          </span>
        )}

        <div className={styles.controls} aria-label="原画工具">
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => setFitMode((mode) => (mode === "cover" ? "contain" : "cover"))}
            title={fitMode === "cover" ? "适应屏幕" : "填充屏幕"}
            aria-label={fitMode === "cover" ? "适应屏幕" : "填充屏幕"}
          >
            {fitMode === "cover" ? <Minimize2 size={18} aria-hidden /> : <Maximize2 size={18} aria-hidden />}
          </button>
          <button
            className={styles.iconButton}
            type="button"
            onClick={toggleViewMode}
            disabled={!canUseFocusVisual}
            title="切换聚焦/原画"
            aria-label="切换聚焦/原画"
          >
            <Users size={18} aria-hidden />
          </button>
          {canUseVideo ? (
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => setMediaMode((mode) => (mode === "video" ? "image" : "video"))}
              title="切换原画/动态原画"
              aria-label="切换原画/动态原画"
            >
              <Film size={18} aria-hidden />
            </button>
          ) : null}
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => setIsPanelOpen(true)}
            title="查看详情"
            aria-label="查看详情"
          >
            <Info size={18} aria-hidden />
          </button>
          <button
            className={styles.downloadButton}
            type="button"
            onClick={handleDownload}
            title="下载当前原画"
            aria-label="下载当前原画"
          >
            <Download size={18} aria-hidden />
          </button>
        </div>
      </div>

      {prevSkin ? <SkinNav className={styles.skinNavLeft} direction="prev" skin={prevSkin} /> : null}
      {nextSkin ? <SkinNav className={styles.skinNavRight} direction="next" skin={nextSkin} /> : null}

      {visuals.length > 1 ? (
        <ChromaDock
          onSelectVisual={setSelectedVisualId}
          selectedVisualId={selectedVisualId}
          visuals={visuals}
        />
      ) : null}

      <aside className={`${styles.panel} ${isPanelOpen ? styles.panelOpen : ""}`} aria-hidden={!isPanelOpen}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            {rarityIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Rarity gems are small dictionary assets.
              <img src={rarityIconUrl} alt={rarityName} title={rarityName} />
            ) : null}
            <h2>
              <span>{selectedVisual?.name ?? skinName}</span>
              <CopyButton value={selectedVisual?.name ?? skinName} />
            </h2>
          </div>
          <button className={styles.iconButton} type="button" onClick={() => setIsPanelOpen(false)} aria-label="关闭详情">
            <X size={18} aria-hidden />
          </button>
        </div>

        <section className={styles.panelDescription}>
          <p>{description}</p>
        </section>

        <section className={styles.panelSection}>
          <h3>关联内容</h3>
          <div className={styles.panelLinks}>
            {championHref ? (
              <Link className={styles.panelLink} href={championHref}>
                <span>{championName}</span>
                <User size={16} aria-hidden />
              </Link>
            ) : null}
            {universes.map((universe) => (
              <Link className={styles.panelLink} href={universe.href} key={universe.href}>
                <span>{universe.label}</span>
                <span>{universe.meta}</span>
              </Link>
            ))}
            {skinlines.map((skinline) => (
              <Link className={styles.panelLink} href={skinline.href} key={skinline.href}>
                <span>{skinline.label}</span>
                <span>{skinline.meta}</span>
              </Link>
            ))}
          </div>
        </section>

        <DetailSection title="基本信息" items={basicDetails} />
        <DetailSection title="国服" items={cnDetails} />
        <DetailSection title="直营服" items={globalDetails} />

        {externalLinks.length ? (
          <section className={styles.panelSection}>
            <h3>外部资源</h3>
            <div className={styles.externalLinks}>
              {externalLinks.map((link) => (
                <a className={styles.externalLink} href={link.href} key={link.href} target="_blank" rel="noreferrer">
                  <span>{link.label}</span>
                  <span>
                    {link.icon === "voice" ? <Mic size={16} aria-hidden /> : null}
                    {link.icon === "video" ? <Film size={16} aria-hidden /> : null}
                    {link.icon === "model" ? <Box size={16} aria-hidden /> : null}
                    <ExternalLink size={16} aria-hidden />
                  </span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </aside>

      <section className={styles.hiddenSeo} aria-label="皮肤详情正文">
        <h2>{skinName}</h2>
        <p>{description}</p>
        <p>
          {championName}，{rarityName}，{globalRarityName}
        </p>
      </section>
    </main>
  );
}

function ChromaDock({
  onSelectVisual,
  selectedVisualId,
  visuals,
}: {
  onSelectVisual: (visualId: string) => void;
  selectedVisualId: string;
  visuals: SkinVisual[];
}) {
  const measureTrackRef = useRef<HTMLDivElement>(null);
  const measureViewportRef = useRef<HTMLDivElement>(null);
  const closeDockTimerRef = useRef<number | undefined>(undefined);
  const wheelLockRef = useRef(false);
  const [api, setApi] = useState<CarouselApi>();
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false);
  const [isDockHoverOpen, setIsDockHoverOpen] = useState(false);
  const [isNamePopoverOpen, setIsNamePopoverOpen] = useState(false);
  const [shouldLoop, setShouldLoop] = useState(false);
  const selectedVisualIndex = visuals.findIndex((visual) => visual.id === selectedVisualId);

  useEffect(() => {
    const measureTrack = measureTrackRef.current;
    const measureViewport = measureViewportRef.current;
    if (!measureTrack || !measureViewport) {
      return undefined;
    }

    const updateShouldLoop = () => {
      setShouldLoop(measureTrack.scrollWidth > measureViewport.clientWidth + 1);
    };
    const resizeObserver = new ResizeObserver(updateShouldLoop);

    resizeObserver.observe(measureTrack);
    resizeObserver.observe(measureViewport);
    updateShouldLoop();

    return () => resizeObserver.disconnect();
  }, [visuals.length]);

  useEffect(() => {
    return () => {
      if (closeDockTimerRef.current) {
        window.clearTimeout(closeDockTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!api || !shouldLoop || selectedVisualIndex < 0) {
      return;
    }

    api.scrollTo(selectedVisualIndex);
  }, [api, selectedVisualIndex, shouldLoop]);

  function openDock() {
    if (closeDockTimerRef.current) {
      window.clearTimeout(closeDockTimerRef.current);
    }

    setIsDockHoverOpen(true);
  }

  function scheduleCloseDock() {
    if (closeDockTimerRef.current) {
      window.clearTimeout(closeDockTimerRef.current);
    }

    closeDockTimerRef.current = window.setTimeout(() => setIsDockHoverOpen(false), 140);
  }

  function handleRailWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!api || !shouldLoop || wheelLockRef.current) {
      return;
    }

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 8) {
      return;
    }

    event.preventDefault();
    wheelLockRef.current = true;

    if (delta > 0) {
      api.scrollNext();
    } else {
      api.scrollPrev();
    }

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 180);
  }

  return (
    <div className={`${styles.chromaDock} ${isDockHoverOpen || isColorPopoverOpen || isNamePopoverOpen ? styles.chromaDockOpen : ""}`}>
      <div
        aria-label="炫彩缩略图"
        className={styles.chromaRail}
        onMouseEnter={openDock}
        onMouseLeave={scheduleCloseDock}
        onWheel={handleRailWheel}
      >
        <div aria-hidden className={styles.chromaMeasureViewport} ref={measureViewportRef}>
          <div className={styles.chromaMeasureTrack} ref={measureTrackRef}>
            {visuals.map((visual) => (
              <span className={styles.chromaMeasureItem} key={visual.id}>
                <ChromaThumb visual={visual} />
              </span>
            ))}
          </div>
        </div>

        {shouldLoop ? (
          <Carousel className={styles.chromaCarousel} opts={{ align: "center", dragFree: true, loop: true }} setApi={setApi}>
            <CarouselContent className={styles.chromaCarouselContent}>
              {visuals.map((visual) => (
                <CarouselItem className={styles.chromaCarouselItem} key={visual.id}>
                  <ChromaButton
                    isSelected={visual.id === selectedVisualId}
                    onColorPopoverOpenChange={setIsColorPopoverOpen}
                    onNamePopoverOpenChange={setIsNamePopoverOpen}
                    onSelectVisual={onSelectVisual}
                    visual={visual}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className={styles.chromaTrack}>
            {visuals.map((visual) => (
              <ChromaButton
                isSelected={visual.id === selectedVisualId}
                key={visual.id}
                onColorPopoverOpenChange={setIsColorPopoverOpen}
                onNamePopoverOpenChange={setIsNamePopoverOpen}
                onSelectVisual={onSelectVisual}
                visual={visual}
              />
            ))}
          </div>
        )}
        {shouldLoop ? (
          <>
            <button className={`${styles.chromaNavButton} ${styles.chromaNavButtonPrev}`} type="button" onClick={() => api?.scrollPrev()} aria-label="上一组炫彩">
              <ArrowLeft size={18} aria-hidden />
            </button>
            <button className={`${styles.chromaNavButton} ${styles.chromaNavButtonNext}`} type="button" onClick={() => api?.scrollNext()} aria-label="下一组炫彩">
              <ArrowRight size={18} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
      {visuals.length ? (
        <div className={styles.chromaLoopHint} aria-label="炫彩分页器" onMouseEnter={openDock} onMouseLeave={scheduleCloseDock}>
          {visuals.map((visual) => (
            <button
              aria-label={`切换到${visual.name}`}
              aria-pressed={visual.id === selectedVisualId}
              className={visual.id === selectedVisualId ? styles.chromaLoopHintActive : ""}
              key={visual.id}
              onClick={() => onSelectVisual(visual.id)}
              type="button"
            >
              <ChromaColorSwatch
                colors={normalizeChromaColors(visual.colors)}
                interactive={false}
                label={visual.colors.length ? `${visual.name} 炫彩颜色` : `${visual.name} 原皮`}
                size={18}
                stopPropagation={false}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChromaButton({
  isSelected,
  onColorPopoverOpenChange,
  onNamePopoverOpenChange,
  onSelectVisual,
  visual,
}: {
  isSelected: boolean;
  onColorPopoverOpenChange: (isOpen: boolean) => void;
  onNamePopoverOpenChange: (isOpen: boolean) => void;
  onSelectVisual: (visualId: string) => void;
  visual: SkinVisual;
}) {
  const colors = normalizeChromaColors(visual.colors);

  return (
    <div
      aria-pressed={isSelected}
      className={styles.chromaButton}
      onClick={() => onSelectVisual(visual.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectVisual(visual.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <ChromaThumb colors={colors} onColorPopoverOpenChange={onColorPopoverOpenChange} visual={visual} />
      <ChromaName name={visual.name} onOpenChange={onNamePopoverOpenChange} />
    </div>
  );
}

function ChromaName({ name, onOpenChange }: { name: string; onOpenChange: (isOpen: boolean) => void }) {
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
    onOpenChange(nextOpen);
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

  return (
    <Popover open={isOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <span
          className={styles.chromaName}
          onClick={(event) => event.stopPropagation()}
          onMouseEnter={openPopover}
          onMouseLeave={scheduleClose}
        >
          {name}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className={styles.chromaNamePopoverContent}
        side="top"
        align="center"
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <span>{name}</span>
        <CopyButton value={name} />
      </PopoverContent>
    </Popover>
  );
}

function ChromaThumb({
  colors,
  onColorPopoverOpenChange,
  visual,
}: {
  colors?: string[];
  onColorPopoverOpenChange?: (isOpen: boolean) => void;
  visual: SkinVisual;
}) {
  return (
    <span className={styles.chromaThumb}>
      {visual.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Chroma thumbs switch client-side.
        <img src={visual.thumbUrl} alt="" />
      ) : null}
      <ChromaColorSwatch
        className={styles.chromaColors}
        colors={colors ?? []}
        label={colors?.length ? `${visual.name} 炫彩颜色` : `${visual.name} 原皮`}
        onOpenChange={onColorPopoverOpenChange}
        size={22}
      />
    </span>
  );
}

function DetailSection({ title, items }: { title: string; items: SkinDetailItem[] }) {
  return (
    <section className={styles.panelSection}>
      <h3>{title}</h3>
      <dl className={styles.definitionList}>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              {item.icons ? (
                <span className={styles.detailIcons}>
                  {item.icons.map((icon) =>
                    icon.iconUrl ? <DetailIcon icon={icon} key={`${icon.name}-${icon.iconUrl}`} /> : null,
                  )}
                </span>
              ) : (
                item.value ?? ""
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DetailIcon({ icon }: { icon: SkinDetailIcon }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!icon.popoverIconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Detail icons are small dictionary assets.
      <img src={icon.iconUrl} alt={icon.name} title={icon.name} />
    );
  }

  function openPopover() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    setIsOpen(true);
  }

  function scheduleClose() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => setIsOpen(false), 120);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={styles.detailIconTrigger}
          type="button"
          aria-label={icon.name}
          title={icon.name}
          onFocus={openPopover}
          onBlur={scheduleClose}
          onMouseEnter={openPopover}
          onMouseLeave={scheduleClose}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Detail icons are small dictionary assets. */}
          <img src={icon.iconUrl} alt="" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={styles.detailIconPopoverContent}
        side="top"
        align="end"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Badge preview should use the source asset dimensions. */}
        <img src={icon.popoverIconUrl} alt="" />
      </PopoverContent>
    </Popover>
  );
}

function buildDownloadFileName(name: string, viewMode: "focus" | "original", isVideo: boolean, url: string) {
  const modeText = viewMode === "focus" ? "聚焦原画" : "原画";
  const mediaText = isVideo ? "动态" : "静态";
  const extension = getFileExtension(url) ?? (isVideo ? "webm" : "jpg");
  return `${sanitizeFileName(name)}-${modeText}-${mediaText}.${extension}`;
}

function getFileExtension(url: string) {
  const pathname = new URL(url, window.location.href).pathname;
  const extension = pathname.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : undefined;
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "skin";
}

function SkinNav({
  className,
  direction,
  skin,
}: {
  className: string;
  direction: "prev" | "next";
  skin: SkinPanelLink;
}) {
  const isPrev = direction === "prev";

  return (
    <Link className={`${styles.skinNav} ${className}`} href={skin.href}>
      {isPrev ? <ArrowLeft size={18} aria-hidden /> : null}
      <span className={styles.skinNavText}>
        <small>{isPrev ? "上一款" : "下一款"}</small>
        <strong>{skin.label}</strong>
      </span>
      {isPrev ? null : <ArrowRight size={18} aria-hidden />}
    </Link>
  );
}

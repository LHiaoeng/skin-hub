"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Info,
  Maximize2,
  Minimize2,
  Palette,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import styles from "@/app/skins/[skinId]/skin-detail-viewer.module.css";
import { ChromaColorSwatch, normalizeChromaColors } from "@/components/skin/chroma-color-swatch";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getContentSection } from "@/lib/navigation/content-sections";

const ChampionIcon = getContentSection("champions").icon;
const UniverseIcon = getContentSection("universes").icon;
const SkinlineIcon = getContentSection("skinlines").icon;

export interface SkinVisual {
  id: string;
  name: string;
  isChroma?: boolean;
  imageUrl?: string;
  focusImageUrl?: string;
  videoUrl?: string;
  focusVideoUrl?: string;
  thumbUrl?: string;
  chromaImageUrl?: string;
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
  cnDetails,
  globalDetails,
  skinlines,
  universes,
  externalLinks,
  prevSkin,
  nextSkin,
  visuals,
}: SkinDetailViewerProps) {
  const router = useRouter();
  const [selectedVisualId, setSelectedVisualId] = useState(visuals[0]?.id ?? "base");
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [viewMode, setViewMode] = useState<"focus" | "original">("focus");
  const [mediaMode, setMediaMode] = useState<"image" | "video">(() => (getVisualVideoUrl(visuals[0], "focus") ? "video" : "image"));
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobileDetailsDrawer, setIsMobileDetailsDrawer] = useState(false);
  const [areControlsActive, setAreControlsActive] = useState(true);
  const controlsIdleTimerRef = useRef<number | undefined>(undefined);
  const touchStartRef = useRef<{ x: number; y: number } | undefined>(undefined);

  const baseVisual = visuals[0];
  const selectedVisual = visuals.find((visual) => visual.id === selectedVisualId) ?? visuals[0];
  const visualUrl = viewMode === "focus"
    ? selectedVisual?.focusImageUrl ?? selectedVisual?.imageUrl
    : selectedVisual?.imageUrl ?? selectedVisual?.focusImageUrl;
  const videoUrl = getVisualVideoUrl(selectedVisual, viewMode);
  const isShowingVideo = mediaMode === "video" && Boolean(videoUrl);
  const downloadUrl = isShowingVideo ? videoUrl : visualUrl;
  const backgroundImageUrl = viewMode === "focus"
    ? baseVisual?.focusImageUrl ?? baseVisual?.imageUrl
    : baseVisual?.imageUrl ?? baseVisual?.focusImageUrl;
  const backgroundVideoUrl = mediaMode === "video" ? getVisualVideoUrl(baseVisual, viewMode) : undefined;
  const chromaVisuals = visuals.filter((visual) => visual.isChroma);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const syncDrawerDirection = () => setIsMobileDetailsDrawer(mediaQuery.matches);

    syncDrawerDirection();
    mediaQuery.addEventListener("change", syncDrawerDirection);

    return () => mediaQuery.removeEventListener("change", syncDrawerDirection);
  }, []);

  useEffect(() => {
    const markActive = () => {
      setAreControlsActive(true);

      if (controlsIdleTimerRef.current) {
        window.clearTimeout(controlsIdleTimerRef.current);
      }

      controlsIdleTimerRef.current = window.setTimeout(() => setAreControlsActive(false), 2000);
    };

    markActive();
    window.addEventListener("pointermove", markActive);
    window.addEventListener("keydown", markActive);

    return () => {
      window.removeEventListener("pointermove", markActive);
      window.removeEventListener("keydown", markActive);
      if (controlsIdleTimerRef.current) {
        window.clearTimeout(controlsIdleTimerRef.current);
      }
    };
  }, []);

  function toggleViewMode() {
    setViewMode((mode) => {
      const nextMode = mode === "focus" ? "original" : "focus";
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, nextMode);
      setMediaMode(getVisualVideoUrl(selectedVisual, nextMode) ? "video" : "image");
      return nextMode;
    });
  }

  function handleSelectVisual(visualId: string) {
    const nextVisual = visuals.find((visual) => visual.id === visualId);

    setSelectedVisualId(visualId);
    setMediaMode(getVisualVideoUrl(nextVisual, viewMode) ? "video" : "image");
  }

  function handleStageTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (isPanelOpen || event.touches.length !== 1) {
      touchStartRef.current = undefined;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleStageTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const start = touchStartRef.current;
    touchStartRef.current = undefined;

    if (!start || isPanelOpen || fitMode !== "contain" || !window.matchMedia("(max-width: 760px)").matches) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const swipeThreshold = 48;
    const directionRatio = 1.2;

    if (absX >= swipeThreshold && absX > absY * directionRatio) {
      const targetSkin = deltaX < 0 ? nextSkin : prevSkin;
      if (targetSkin) router.push(targetSkin.href);
      return;
    }

    if (visuals.length <= 1 || absY < swipeThreshold || absY <= absX * directionRatio) {
      return;
    }

    const selectedIndex = Math.max(0, visuals.findIndex((visual) => visual.id === selectedVisualId));
    const direction = deltaY < 0 ? 1 : -1;
    const nextIndex = (selectedIndex + direction + visuals.length) % visuals.length;
    handleSelectVisual(visuals[nextIndex].id);
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
    <Drawer
      direction={isMobileDetailsDrawer ? "bottom" : "right"}
      open={isPanelOpen}
      onOpenChange={setIsPanelOpen}
    >
      <main
        className={styles.viewer}
        data-controls-state={areControlsActive ? "active" : "idle"}
        data-fit-mode={fitMode}
      >
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

      <section
        className={styles.stage}
        aria-label={`${skinName} 原画查看`}
        onTouchStart={handleStageTouchStart}
        onTouchEnd={handleStageTouchEnd}
        onTouchCancel={() => {
          touchStartRef.current = undefined;
        }}
      >
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
        <ButtonGroup className={styles.titleActions} aria-label="皮肤信息">
          <Button
            className={`${styles.cornerButton} ${styles.iconButton}`}
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            aria-label="返回上一页"
          >
            <ArrowLeft aria-hidden />
          </Button>
          {championHref ? (
            <Button className={`${styles.cornerButton} ${styles.actionButton}`} variant="ghost" size="sm" asChild>
              <Link href={championHref} aria-label={`查看${championName}详情页`}>
                <ChampionIcon data-icon="inline-start" aria-hidden />
                <span>{championName}</span>
              </Link>
            </Button>
          ) : (
            <Button className={`${styles.cornerButton} ${styles.actionButton}`} variant="ghost" size="sm" asChild>
              <span aria-label={championName}>
                <ChampionIcon data-icon="inline-start" aria-hidden />
                <span>{championName}</span>
              </span>
            </Button>
          )}
        </ButtonGroup>

        <ButtonGroup className={styles.controls} aria-label="原画工具">
          <Button
            className={`${styles.cornerButton} ${styles.iconButton} ${styles.fitModeButton}`}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFitMode((mode) => (mode === "cover" ? "contain" : "cover"))}
            title={fitMode === "cover" ? "适应屏幕" : "填充屏幕"}
            aria-label={fitMode === "cover" ? "适应屏幕" : "填充屏幕"}
          >
            {fitMode === "cover" ? <Minimize2 data-icon="inline-start" aria-hidden /> : <Maximize2 data-icon="inline-start" aria-hidden />}
          </Button>
          <Button
            className={`${styles.cornerButton} ${styles.iconButton}`}
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleViewMode}
            disabled={!canUseFocusVisual}
            title="切换聚焦/原画"
            aria-label="切换聚焦/原画"
          >
            <Users data-icon="inline-start" aria-hidden />
          </Button>
          {canUseVideo ? (
            <Button
              className={`${styles.cornerButton} ${styles.iconButton}`}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMediaMode((mode) => (mode === "video" ? "image" : "video"))}
              title="切换原画/动态原画"
              aria-label="切换原画/动态原画"
            >
              {mediaMode === "image" ? <Film data-icon="inline-start" aria-hidden /> : <ImageIcon data-icon="inline-start" aria-hidden />}
            </Button>
          ) : null}
          <Button
            className={`${styles.cornerButton} ${styles.iconButton}`}
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            title="下载当前原画"
            aria-label="下载当前原画"
          >
            <Download data-icon="inline-start" aria-hidden />
          </Button>
          <DrawerTrigger asChild>
            <Button
              className={`${styles.cornerButton} ${styles.actionButton} ${styles.skinTitleButton}`}
              type="button"
              variant="ghost"
              size="sm"
              onMouseEnter={() => setIsPanelOpen(true)}
              title="查看详情"
              aria-label="查看详情"
            >
              {rarityIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Rarity gems are small dictionary assets.
                <img src={rarityIconUrl} alt="" />
              ) : null}
              <span>{selectedVisual?.name ?? skinName}</span>
              <Info data-icon="inline-start" aria-hidden />
            </Button>
          </DrawerTrigger>
        </ButtonGroup>
      </div>

      {prevSkin ? <SkinNav className={styles.skinNavLeft} direction="prev" skin={prevSkin} /> : null}
      {nextSkin ? <SkinNav className={styles.skinNavRight} direction="next" skin={nextSkin} /> : null}

      {visuals.length > 1 ? (
        <ChromaDock
          onSelectVisual={handleSelectVisual}
          selectedVisualId={selectedVisualId}
          visuals={visuals}
        />
      ) : null}

      <DrawerTrigger asChild>
        <Button
          className={`${styles.cornerButton} ${styles.mobileSkinTitle}`}
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`查看${selectedVisual?.name ?? skinName}详情`}
        >
          {rarityIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Rarity gems are small dictionary assets.
            <img src={rarityIconUrl} alt="" />
          ) : null}
          <span>{selectedVisual?.name ?? skinName}</span>
          <Info data-icon="inline-end" aria-hidden />
        </Button>
      </DrawerTrigger>

      <DrawerContent className={styles.panel}>
          <DrawerHeader className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            {rarityIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Rarity gems are small dictionary assets.
              <img src={rarityIconUrl} alt={rarityName} title={rarityName} />
            ) : null}
            <DrawerTitle asChild>
              <h2>
                <span>
                  {selectedVisual?.name ?? skinName}
                  <CopyButton value={selectedVisual?.name ?? skinName} />
                </span>
              </h2>
            </DrawerTitle>
          </div>
          </DrawerHeader>

          <DrawerDescription asChild>
            <div className={styles.panelDescription}>
              <span>{description}</span>
              <CopyButton value={description} />
            </div>
          </DrawerDescription>

          <section className={styles.panelSection}>
          <h3>关联内容</h3>
          <div className={styles.panelLinks}>
            {championHref ? (
              <Link className={styles.panelLink} href={championHref}>
                <ChampionIcon aria-hidden />
                <span>{championName}</span>
              </Link>
            ) : null}
            {universes.map((universe) => (
              <Link className={styles.panelLink} href={universe.href} key={universe.href}>
                <UniverseIcon aria-hidden />
                <span>{universe.label}</span>
              </Link>
            ))}
            {skinlines.map((skinline) => (
              <Link className={styles.panelLink} href={skinline.href} key={skinline.href}>
                <SkinlineIcon aria-hidden />
                <span>{skinline.label}</span>
              </Link>
            ))}
          </div>
          </section>

          <section className={styles.panelSection}>
            <h3>基本信息</h3>
            <DetailCollapsible defaultOpen items={cnDetails} title="国服" />
            <DetailCollapsible items={globalDetails} title="直营服" />
          </section>

          <ChromaCollapsible visuals={chromaVisuals} />

          {externalLinks.length ? (
            <section className={styles.panelSection}>
            <h3>外部资源</h3>
            <div className={styles.externalLinks}>
              {externalLinks.map((link) => (
                <a className={styles.externalLink} href={link.href} key={link.href} target="_blank" rel="noreferrer">
                  <span>{link.label}</span>
                  <ExternalLink aria-hidden />
                </a>
              ))}
            </div>
            </section>
          ) : null}
      </DrawerContent>

      <section className={styles.hiddenSeo} aria-label="皮肤详情正文">
        <h2>{skinName}</h2>
        <p>{description}</p>
        <p>
          {championName}，{rarityName}，{globalRarityName}
        </p>
      </section>
      </main>
    </Drawer>
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
        <ButtonGroup className={styles.chromaLoopHint} aria-label="炫彩分页器" onMouseEnter={openDock} onMouseLeave={scheduleCloseDock}>
          {visuals.map((visual) => (
            <Button
              aria-label={`切换到${visual.name}`}
              aria-pressed={visual.id === selectedVisualId}
              className={styles.chromaLoopHintButton}
              key={visual.id}
              onClick={() => onSelectVisual(visual.id)}
              size="sm"
              type="button"
              variant="outline"
            >
              <ChromaColorSwatch
                colors={normalizeChromaColors(visual.colors)}
                interactive={false}
                label={visual.colors.length ? `${visual.name} 炫彩颜色` : `${visual.name} 原皮`}
                size={18}
                stopPropagation={false}
              />
            </Button>
          ))}
        </ButtonGroup>
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

function DetailCollapsible({
  defaultOpen = false,
  items,
  title,
}: {
  defaultOpen?: boolean;
  items: SkinDetailItem[];
  title: string;
}) {
  return (
    <Collapsible className={styles.detailCollapsible} defaultOpen={defaultOpen}>
      <CollapsibleTrigger asChild>
        <Button className={styles.collapsibleTrigger} type="button" variant="ghost">
          <span>{title}</span>
          <ChevronDown data-icon="inline-end" aria-hidden />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className={styles.collapsibleContent}>
        <DetailList items={items} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function DetailList({ items }: { items: SkinDetailItem[] }) {
  return (
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
  );
}

function ChromaCollapsible({ visuals }: { visuals: SkinVisual[] }) {
  return (
    <Collapsible className={styles.detailCollapsible}>
      <CollapsibleTrigger asChild>
        <Button className={styles.collapsibleTrigger} type="button" variant="ghost">
          <span className={styles.collapsibleLabel}>
            <Palette data-icon="inline-start" aria-hidden />
            <span>{visuals.length}个炫彩外观</span>
          </span>
          <ChevronDown data-icon="inline-end" aria-hidden />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className={styles.collapsibleContent}>
        {visuals.length ? (
          <div className={styles.drawerChromaList}>
            {visuals.map((visual) => (
              <HoverCard closeDelay={80} key={visual.id} openDelay={120}>
                <HoverCardTrigger asChild>
                  <div className={styles.drawerChromaItem} tabIndex={0}>
                    {visual.chromaImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Drawer chroma tiles must use the source chromaPath without fallback.
                      <img className={styles.drawerChromaImage} src={visual.chromaImageUrl} alt={visual.name} />
                    ) : (
                      <div className={styles.drawerChromaImageMissing} aria-label={`${visual.name}无炫彩图片`} />
                    )}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className={styles.drawerChromaHoverCard} align="center" side="left">
                  <div className={styles.drawerChromaHoverContent}>
                    <ChromaColorSwatch
                      colors={normalizeChromaColors(visual.colors)}
                      interactive={false}
                      label={`${visual.name} 炫彩颜色`}
                      size={18}
                      stopPropagation={false}
                    />
                    <span>{visual.name}</span>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        ) : (
          <p className={styles.emptyChromaText}>暂无炫彩外观</p>
        )}
      </CollapsibleContent>
    </Collapsible>
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

function getVisualVideoUrl(visual: SkinVisual | undefined, viewMode: "focus" | "original") {
  return viewMode === "focus"
    ? visual?.focusVideoUrl ?? visual?.videoUrl
    : visual?.videoUrl ?? visual?.focusVideoUrl;
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
    <ButtonGroup className={`${styles.skinNavGroup} ${className}`} aria-label={isPrev ? "上一个皮肤" : "下一个皮肤"}>
      <Button className={`${styles.cornerButton} ${styles.skinNav}`} variant="ghost" size="sm" asChild>
        <Link href={skin.href}>
          {isPrev ? <ArrowLeft data-icon="inline-start" aria-hidden /> : null}
          <span className={styles.skinNavText}>
            <strong>{skin.label}</strong>
          </span>
          {isPrev ? null : <ArrowRight data-icon="inline-end" aria-hidden />}
        </Link>
      </Button>
    </ButtonGroup>
  );
}

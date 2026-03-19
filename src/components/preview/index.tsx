
import React, { useEffect, useMemo, useState, useRef } from "react";
import throttle from "lodash/throttle";
import { toast } from "sonner";
import { DEFAULT_TEMPLATES } from "@/config";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import {
  useAutoOnePage,
  AUTO_ONE_PAGE_MAX_SCALE,
  AUTO_ONE_PAGE_MIN_SCALE,
} from "@/hooks/useAutoOnePage";
import { useTranslations } from "@/i18n/compat/client";
import { A4_HEIGHT_PX, AUTO_ONE_PAGE_MIN_MARGIN_PX } from "@/lib/a4";
import { normalizeFontFamily } from "@/utils/fonts";
import type { GlobalSettings, ResumeData } from "@/types/resume";
import ResumeTemplateComponent from "../templates";

interface PreviewPanelProps {
  sidePanelCollapsed: boolean;
  editPanelCollapsed: boolean;
  previewPanelCollapsed: boolean;
  toggleSidePanel: () => void;
  toggleEditPanel: () => void;
  togglePreviewPanel: () => void;
}

const HEIGHT_EPSILON_PX = 1;
const SCALE_EPSILON = 0.01;
const MAX_AUTO_FEEDBACK_ROUNDS = 4;

const clampScale = (value: number) =>
  Math.max(AUTO_ONE_PAGE_MIN_SCALE, Math.min(AUTO_ONE_PAGE_MAX_SCALE, value));

const scaleGlobalSettings = (
  settings: GlobalSettings | undefined,
  factor: number
): GlobalSettings | undefined => {
  if (!settings || Math.abs(factor - 1) < 0.001) {
    return settings;
  }

  const scaleNumber = (value: number | undefined, fallback: number) =>
    (value ?? fallback) * factor;

  const sectionHeights = settings.sectionHeights
    ? Object.fromEntries(
      Object.entries(settings.sectionHeights).map(([key, value]) => [
        key,
        value * factor,
      ])
    )
    : settings.sectionHeights;

  return {
    ...settings,
    baseFontSize: scaleNumber(settings.baseFontSize, 16),
    pagePadding: settings.pagePadding,
    headerSize: scaleNumber(settings.headerSize, 18),
    subheaderSize: scaleNumber(settings.subheaderSize, 16),
    sectionSpacing: scaleNumber(settings.sectionSpacing, 10),
    paragraphSpacing: scaleNumber(settings.paragraphSpacing, 12),
    sectionHeights,
  };
};

const scaleResumeForPreview = (
  resume: ResumeData,
  factor: number
): ResumeData => {
  if (Math.abs(factor - 1) < 0.001) {
    return resume;
  }

  const photoConfig = resume.basic?.photoConfig;
  const scaledPhotoConfig = photoConfig
    ? {
      ...photoConfig,
      width: photoConfig.width * factor,
      height: photoConfig.height * factor,
      customBorderRadius: photoConfig.customBorderRadius * factor,
    }
    : photoConfig;

  return {
    ...resume,
    globalSettings:
      scaleGlobalSettings(resume.globalSettings, factor) ?? resume.globalSettings,
    basic: {
      ...resume.basic,
      photoConfig: scaledPhotoConfig,
    },
  };
};

const PageBreakLine = React.memo(
  ({
    pageNumber,
    contentPerPagePx,
    pagePadding,
  }: {
    pageNumber: number;
    contentPerPagePx: number;
    pagePadding: number;
  }) => {
    // 预览中 #resume-preview 有 padding-top，内容从 pagePadding 位置开始
    // 每页能容纳 contentPerPagePx 高度的内容（与 Puppeteer PDF margin 一致）
    // 第 N 页结束位置 = pagePadding + N * contentPerPagePx
    const top = pagePadding + pageNumber * contentPerPagePx;

    return (
      <div
        className="absolute left-0 right-0 pointer-events-none page-break-line"
        style={{ top: `${top}px` }}
      >
        <div className="relative w-full">
          <div className="absolute w-full border-t-2 border-dashed border-red-400" />
          <div className="absolute right-0 -top-6 text-xs text-red-500">
            第{pageNumber}页结束
          </div>
        </div>
      </div>
    );
  }
);

PageBreakLine.displayName = "PageBreakLine";

const PreviewPanel = React.forwardRef<HTMLDivElement, PreviewPanelProps>(
  (
    {
      sidePanelCollapsed,
      editPanelCollapsed,
      previewPanelCollapsed,
      toggleSidePanel,
      toggleEditPanel,
      togglePreviewPanel,
    },
    ref
  ) => {
    const { activeResume, setActiveSection } = useResumeStore();
    const selectedFontFamily = normalizeFontFamily(
      activeResume?.globalSettings?.fontFamily
    );
    const t = useTranslations("previewDock");
    const template = useMemo(() => {
      return (
        DEFAULT_TEMPLATES.find((t) => t.id === activeResume?.templateId) ||
        DEFAULT_TEMPLATES[0]
      );
    }, [activeResume?.templateId]);

    const startRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const measureContentRef = useRef<HTMLDivElement>(null);
    const internalVisibleContentRef = useRef<HTMLDivElement>(null);
    const visibleContentRef =
      (ref as React.MutableRefObject<HTMLDivElement>) || internalVisibleContentRef;
    const [baselineContentHeight, setBaselineContentHeight] = useState(0);
    const [displayContentHeight, setDisplayContentHeight] = useState(0);
    const [stableScaleFactor, setStableScaleFactor] = useState(1);
    const [feedbackRounds, setFeedbackRounds] = useState(0);
    const stableScaleRef = useRef(1);
    const measuredDisplayScaleRef = useRef<number>(Number.NaN);

    useEffect(() => {
      stableScaleRef.current = stableScaleFactor;
    }, [stableScaleFactor]);

    const updateMeasuredHeights = () => {
      const nextBaselineHeight = measureContentRef.current?.scrollHeight ?? 0;
      if (nextBaselineHeight > 0) {
        setBaselineContentHeight((prev) => {
          if (Math.abs(prev - nextBaselineHeight) <= HEIGHT_EPSILON_PX) return prev;
          return nextBaselineHeight;
        });
      }

      const nextDisplayHeight = visibleContentRef.current?.scrollHeight ?? 0;
      if (nextDisplayHeight > 0) {
        measuredDisplayScaleRef.current = stableScaleRef.current;
        setDisplayContentHeight((prev) => {
          if (Math.abs(prev - nextDisplayHeight) <= HEIGHT_EPSILON_PX) return prev;
          return nextDisplayHeight;
        });
      }
    };

    useEffect(() => {
      const debouncedUpdate = throttle(() => {
        requestAnimationFrame(() => {
          updateMeasuredHeights();
        });
      }, 100);

      const mutationObserver = new MutationObserver(debouncedUpdate);
      const resizeObserver = new ResizeObserver(debouncedUpdate);

      const observedElements = [measureContentRef.current, visibleContentRef.current].filter(
        Boolean
      ) as HTMLElement[];

      observedElements.forEach((element) => {
        mutationObserver.observe(element, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
        resizeObserver.observe(element);
      });

      debouncedUpdate();

      return () => {
        mutationObserver.disconnect();
        resizeObserver.disconnect();
        debouncedUpdate.cancel();
      };
    }, [activeResume?.id, visibleContentRef]);

    useEffect(() => {
      if (activeResume) {
        const timer = setTimeout(updateMeasuredHeights, 300);
        return () => clearTimeout(timer);
      }
    }, [activeResume]);

    const autoOnePageEnabled = activeResume?.globalSettings?.autoOnePage || false;
    const basePagePadding = activeResume?.globalSettings?.pagePadding || 0;
    const onePageBoundaryPadding = autoOnePageEnabled
      ? Math.max(basePagePadding, AUTO_ONE_PAGE_MIN_MARGIN_PX)
      : basePagePadding;

    const { scaleFactor, isScaled, cannotFit } = useAutoOnePage({
      contentHeight: baselineContentHeight,
      pagePadding: onePageBoundaryPadding,
      enabled: autoOnePageEnabled,
    });

    useEffect(() => {
      if (!autoOnePageEnabled) {
        setStableScaleFactor(1);
        setFeedbackRounds(0);
        return;
      }

      const baseScale = isScaled ? scaleFactor : 1;
      setStableScaleFactor((prev) =>
        Math.abs(prev - baseScale) > SCALE_EPSILON ? baseScale : prev
      );
      setFeedbackRounds(0);
      measuredDisplayScaleRef.current = Number.NaN;
    }, [
      autoOnePageEnabled,
      isScaled,
      scaleFactor,
      baselineContentHeight,
      onePageBoundaryPadding,
      activeResume?.id,
    ]);

    const appliedScaleFactor =
      autoOnePageEnabled ? stableScaleFactor : 1;

    const shouldUseSettingsScale =
      autoOnePageEnabled && Math.abs(appliedScaleFactor - 1) > 0.001;

    const previewResume = useMemo<ResumeData | null | undefined>(() => {
      if (!activeResume) {
        return activeResume;
      }

      if (!shouldUseSettingsScale) {
        return activeResume;
      }

      return scaleResumeForPreview(activeResume, appliedScaleFactor);
    }, [activeResume, shouldUseSettingsScale, appliedScaleFactor]);

    const displayPagePadding = autoOnePageEnabled
      ? onePageBoundaryPadding
      : (previewResume?.globalSettings?.pagePadding ?? basePagePadding);

    const availableContentPerPage = useMemo(
      () => A4_HEIGHT_PX - 2 * displayPagePadding,
      [displayPagePadding]
    );

    const displayActualContentHeight = useMemo(() => {
      if (displayContentHeight <= 0) {
        return 0;
      }
      // scrollHeight 包含 #resume-preview 上下 padding
      return Math.max(0, displayContentHeight - 2 * displayPagePadding);
    }, [displayContentHeight, displayPagePadding]);

    useEffect(() => {
      if (!autoOnePageEnabled) {
        return;
      }

      if (
        availableContentPerPage <= 0 ||
        displayActualContentHeight <= 0 ||
        feedbackRounds >= MAX_AUTO_FEEDBACK_ROUNDS
      ) {
        return;
      }

      const measuredScale = measuredDisplayScaleRef.current;
      if (!Number.isFinite(measuredScale)) {
        return;
      }

      if (Math.abs(measuredScale - stableScaleFactor) > SCALE_EPSILON) {
        return;
      }

      const heightDiff = displayActualContentHeight - availableContentPerPage;
      if (Math.abs(heightDiff) <= HEIGHT_EPSILON_PX) {
        return;
      }

      const nextScale = clampScale(
        stableScaleFactor * (availableContentPerPage / displayActualContentHeight)
      );
      if (Math.abs(nextScale - stableScaleFactor) <= SCALE_EPSILON) {
        return;
      }

      const frameId = requestAnimationFrame(() => {
        setStableScaleFactor(nextScale);
        setFeedbackRounds((prev) => prev + 1);
        measuredDisplayScaleRef.current = Number.NaN;
      });

      return () => cancelAnimationFrame(frameId);
    }, [
      autoOnePageEnabled,
      availableContentPerPage,
      displayActualContentHeight,
      stableScaleFactor,
      feedbackRounds,
    ]);

    const fallbackCannotFit = useMemo(() => {
      if (
        !autoOnePageEnabled ||
        availableContentPerPage <= 0 ||
        displayActualContentHeight <= 0
      ) {
        return false;
      }
      return (
        stableScaleFactor <= AUTO_ONE_PAGE_MIN_SCALE + 0.001 &&
        displayActualContentHeight > availableContentPerPage + HEIGHT_EPSILON_PX
      );
    }, [
      autoOnePageEnabled,
      availableContentPerPage,
      displayActualContentHeight,
      stableScaleFactor,
    ]);

    const finalCannotFit = cannotFit || fallbackCannotFit;

    useEffect(() => {
      if (autoOnePageEnabled && finalCannotFit) {
        toast.warning(t("autoOnePage.cannotFit"), {
          duration: 4000,
        });
      }
    }, [autoOnePageEnabled, finalCannotFit, t]);

    const { contentPerPagePx, pageBreakCount } = useMemo(() => {
      // 与 Puppeteer PDF 导出一致：margin: pagePadding px（上下各一份）
      // 每页可用内容高度 = A4 总高度 - 上 margin - 下 margin
      if (availableContentPerPage <= 0) {
        return { contentPerPagePx: 0, pageBreakCount: 0 };
      }

      // 一页纸模式启用且内容能完美一页时，才隐藏分页线
      // cannotFit 时内容仍超出一页，需要保留分页线
      if ((autoOnePageEnabled && !finalCannotFit) || displayActualContentHeight <= 0) {
        return { contentPerPagePx: availableContentPerPage, pageBreakCount: 0 };
      }

      const pageCount = Math.max(
        1,
        Math.ceil(displayActualContentHeight / availableContentPerPage)
      );
      const pageBreakCount = Math.max(0, pageCount - 1);

      return { contentPerPagePx: availableContentPerPage, pageBreakCount };
    }, [
      autoOnePageEnabled,
      finalCannotFit,
      displayActualContentHeight,
      availableContentPerPage,
    ]);

    const onePageUsage = useMemo(() => {
      if (
        !autoOnePageEnabled ||
        availableContentPerPage <= 0 ||
        displayActualContentHeight <= 0
      ) {
        return null;
      }

      const rawUsage = Math.round(
        (displayActualContentHeight / availableContentPerPage) * 100
      );

      if (!finalCannotFit) {
        return Math.max(0, Math.min(100, rawUsage));
      }

      return Math.max(0, rawUsage);
    }, [
      autoOnePageEnabled,
      availableContentPerPage,
      displayActualContentHeight,
      finalCannotFit,
    ]);

    const lockA4Canvas = autoOnePageEnabled && !finalCannotFit;

    if (!activeResume) return null;

    const handlePreviewClickCapture = (
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      const target = event.target as HTMLElement | null;
      const sectionElement = target?.closest<HTMLElement>(
        "[data-resume-section-id]"
      );
      const sectionId = sectionElement?.dataset.resumeSectionId;

      if (!sectionId || sectionId === activeResume.activeSection) {
        return;
      }

      setActiveSection(sectionId);
    };

    return (
      <div
        ref={previewRef}
        className="relative w-full h-full  bg-accent/40"
        style={{
          fontFamily: selectedFontFamily,
        }}
      >
        <div
          className="absolute top-0 -left-[99999px] w-[210mm] pointer-events-none opacity-0"
          aria-hidden="true"
        >
          <div
            ref={measureContentRef}
            style={{
              fontFamily: selectedFontFamily,
              padding: `${onePageBoundaryPadding}px`,
            }}
            className="relative"
          >
            <ResumeTemplateComponent data={activeResume} template={template} />
          </div>
        </div>
        <div className="py-4 ml-4 px-4 min-h-screen flex justify-center scale-[58%] origin-top md:scale-90 md:origin-top-left">
          <div
            ref={startRef}
            className={cn(
              "w-[210mm] min-w-[210mm]",
              "bg-white",
              "shadow-lg",
              "relative mx-auto",
              lockA4Canvas ? "h-[297mm] overflow-hidden" : "min-h-[297mm]"
            )}
          >
            {autoOnePageEnabled && onePageUsage !== null && (
              <div
                className={cn(
                  "absolute top-3 right-3 z-10 pointer-events-none rounded-full px-3 py-1 text-[11px] font-medium shadow-sm",
                  finalCannotFit
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                )}
              >
                {finalCannotFit
                  ? t("autoOnePage.statusCannotFit")
                  : t("autoOnePage.statusFitted")}
                {" · "}
                {t("autoOnePage.usage", { ratio: onePageUsage })}
              </div>
            )}
            <div
              ref={visibleContentRef}
              id="resume-preview"
              onClickCapture={handlePreviewClickCapture}
              style={{
                fontFamily: selectedFontFamily,
                padding: `${displayPagePadding}px`,
              }}
              className="relative"
            >
              <style jsx global>{`
              .grammar-error {
                cursor: help;
                border-bottom: 2px dashed;
                transition: background-color 0.2s ease;
              }

              .grammar-error.spelling {
                border-color: #ef4444;
              }

              .grammar-error.grammar {
                border-color: #f59e0b;
              }

              .grammar-error:hover {
                background-color: rgba(239, 68, 68, 0.1);
              }

              /* 使用属性选择器匹配所有active-*类 */
              .grammar-error[class*="active-"] {
                animation: highlight 2s ease-in-out;
              }

              @keyframes highlight {
                0% {
                  background-color: transparent;
                }
                20% {
                  background-color: rgba(239, 68, 68, 0.2);
                }
                80% {
                  background-color: rgba(239, 68, 68, 0.2);
                }
                100% {
                  background-color: transparent;
                }
              }
            `}</style>
              <ResumeTemplateComponent
                data={(previewResume || activeResume) as ResumeData}
                template={template}
              />
              {displayContentHeight > 0 && (
                <>
                  <div key={`page-breaks-container-${displayContentHeight}`}>
                    {Array.from(
                      { length: Math.min(pageBreakCount, 20) },
                      (_, i) => {
                        const pageNumber = i + 1;

                        const pageLinePosition =
                          displayPagePadding + pageNumber * contentPerPagePx;

                        if (pageLinePosition <= displayContentHeight) {
                          return (
                            <PageBreakLine
                              key={`page-break-${pageNumber}`}
                              pageNumber={pageNumber}
                              contentPerPagePx={contentPerPagePx}
                              pagePadding={displayPagePadding}
                            />
                          );
                        }
                        return null;
                      }
                    ).filter(Boolean)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

PreviewPanel.displayName = "PreviewPanel";

export default PreviewPanel;

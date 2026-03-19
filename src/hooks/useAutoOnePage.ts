import { useMemo } from "react";
import { A4_HEIGHT_PX } from "@/lib/a4";

// 尽可能缩小超页内容，但保留可读性底线
export const AUTO_ONE_PAGE_MIN_SCALE = 0.5;
// 内容较少时尽可能放大，但限制在可用视觉范围内
export const AUTO_ONE_PAGE_MAX_SCALE = 1.5;

interface UseAutoOnePageOptions {
  contentHeight: number;
  pagePadding: number;
  enabled: boolean;
}

interface UseAutoOnePageResult {
  scaleFactor: number;
  isScaled: boolean;
  /** 内容过多，即使缩放到下限也无法完美一页 */
  cannotFit: boolean;
}

export function useAutoOnePage({
  contentHeight,
  pagePadding,
  enabled,
}: UseAutoOnePageOptions): UseAutoOnePageResult {
  return useMemo(() => {
    if (!enabled || contentHeight <= 0) {
      return { scaleFactor: 1, isScaled: false, cannotFit: false };
    }

    // 一页纸按 A4 内容边界适配（扣除上下页边距），而不是整张纸高度
    const availableContentHeight = A4_HEIGHT_PX - 2 * pagePadding;
    if (availableContentHeight <= 0) {
      return { scaleFactor: 1, isScaled: false, cannotFit: false };
    }

    // 测量层高度包含上下 padding，缩放计算时仅比较真实内容区高度
    const actualContentHeight = contentHeight - 2 * pagePadding;
    if (actualContentHeight <= 0) {
      return { scaleFactor: 1, isScaled: false, cannotFit: false };
    }

    const idealScale = availableContentHeight / actualContentHeight;
    const clampedScale = Math.max(
      AUTO_ONE_PAGE_MIN_SCALE,
      Math.min(AUTO_ONE_PAGE_MAX_SCALE, idealScale)
    );

    return {
      scaleFactor: clampedScale,
      isScaled: Math.abs(clampedScale - 1) > 0.001,
      cannotFit: idealScale < AUTO_ONE_PAGE_MIN_SCALE,
    };
  }, [contentHeight, pagePadding, enabled]);
}

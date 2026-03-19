import { PDF_EXPORT_CONFIG } from "@/config";
import { normalizeFontFamily } from "@/utils/fonts";

export const getOptimizedStyles = () => {
  const styleCache = new Map();
  const startTime = performance.now();

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .filter((rule) => {
            const ruleText = rule.cssText;
            const normalizedRuleText = ruleText.toLowerCase();
            if (styleCache.has(ruleText)) return false;
            styleCache.set(ruleText, true);

            if (rule instanceof CSSFontFaceRule) return false;
            if (rule instanceof CSSImportRule) return false;
            if (normalizedRuleText.includes("fonts.googleapis.com")) return false;
            if (normalizedRuleText.includes("fonts.gstatic.com")) return false;
            if (ruleText.includes("font-family")) return false;
            if (ruleText.includes("@keyframes")) return false;
            if (ruleText.includes("animation")) return false;
            if (ruleText.includes("transition")) return false;
            if (ruleText.includes("hover")) return false;
            return true;
          })
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        console.warn("Style processing error:", e);
        return "";
      }
    })
    .join("\n");

  console.log(`Style processing took ${performance.now() - startTime}ms`);
  return styles;
};

export const optimizeImages = async (element: HTMLElement) => {
  const startTime = performance.now();
  const images = element.getElementsByTagName("img");

  const imagePromises = Array.from(images)
    .filter((img) => !img.src.startsWith("data:"))
    .map(async (img) => {
      try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.src = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Image conversion error:", error);
        return Promise.resolve();
      }
    });

  await Promise.all(imagePromises);
  console.log(`Image processing took ${performance.now() - startTime}ms`);
};

export interface ExportToPdfOptions {
  elementId: string;
  title: string;
  pagePadding?: number;
  fontFamily?: string;
  onStart?: () => void;
  onEnd?: () => void;
  strategy?: PdfExportStrategy;
}

export type PdfExportChannel = "local" | "remote";
export type PdfExportStrategy = "auto" | "local-only" | "remote-only";

export interface PdfExportAttempt {
  channel: PdfExportChannel;
  url: string;
  ok: boolean;
  status?: number;
  code?: string;
  message: string;
}

export interface ExportToPdfResult {
  success: boolean;
  usedChannel?: PdfExportChannel;
  attempts: PdfExportAttempt[];
  errorCode?: string;
  errorMessage?: string;
}

interface ServerErrorPayload {
  code?: string;
  message?: string;
  error?: string;
  details?: string;
}

const resolveChannels = (strategy: PdfExportStrategy): PdfExportChannel[] => {
  if (strategy === "local-only") return ["local"];
  if (strategy === "remote-only") return ["remote"];
  return ["local", "remote"];
};

const resolveChannelUrl = (channel: PdfExportChannel) =>
  channel === "local"
    ? PDF_EXPORT_CONFIG.LOCAL_SERVER_URL
    : PDF_EXPORT_CONFIG.REMOTE_SERVER_URL;

const resolveMargin = (element: HTMLElement, fallback?: number) => {
  const computedPaddingTop = Number.parseFloat(
    window.getComputedStyle(element).paddingTop
  );

  if (Number.isFinite(computedPaddingTop)) {
    return Math.max(0, computedPaddingTop);
  }

  return Math.max(0, fallback || 0);
};

const parseErrorPayload = async (response: Response) => {
  let payload: ServerErrorPayload | null = null;
  try {
    payload = (await response.json()) as ServerErrorPayload;
  } catch {
    payload = null;
  }

  const message =
    payload?.message ||
    payload?.error ||
    `HTTP ${response.status} ${response.statusText}`.trim();

  return {
    code: payload?.code,
    message: payload?.details ? `${message} (${payload.details})` : message,
  };
};

export const exportToPdf = async ({
  elementId,
  title,
  pagePadding,
  fontFamily,
  onStart,
  onEnd,
  strategy = "auto",
}: ExportToPdfOptions): Promise<ExportToPdfResult> => {
  const exportStartTime = performance.now();
  onStart?.();
  const attempts: PdfExportAttempt[] = [];

  try {
    const pdfElement = document.querySelector<HTMLElement>(`#${elementId}`);
    if (!pdfElement) {
      throw new Error(`PDF element #${elementId} not found`);
    }

    const margin = resolveMargin(pdfElement, pagePadding);
    const clonedElement = pdfElement.cloneNode(true) as HTMLElement;
    const selectedFontFamily = normalizeFontFamily(fontFamily);
    const transformValue = clonedElement.style.transform || "";
    const scaleMatch = transformValue.match(/scale\(([\d.]+)\)/);
    
    if (scaleMatch) {
      const scale = Number(scaleMatch[1]);
      if (Number.isFinite(scale) && scale > 0 && Math.abs(scale - 1) > 0.001) {
        // 服务端导出前将 transform 缩放转为 zoom，避免分页计算偏差（含放大/缩小）
        clonedElement.style.removeProperty("transform");
        clonedElement.style.removeProperty("transform-origin");
        clonedElement.style.setProperty("width", "100%", "important");
        clonedElement.style.setProperty("zoom", String(scale));
      }
    }

    // 采用 PdfExport.tsx 中的逻辑，统一宽度和 padding 处理
    clonedElement.style.setProperty("width", "100%", "important");
    clonedElement.style.setProperty("padding", "0", "important");
    clonedElement.style.setProperty("box-sizing", "border-box");
    clonedElement.style.setProperty("font-family", selectedFontFamily, "important");

    const pageBreakLines = clonedElement.querySelectorAll<HTMLElement>(".page-break-line");
    pageBreakLines.forEach((line) => {
      line.style.display = "none";
    });
    const a4BoundaryLines = clonedElement.querySelectorAll<HTMLElement>(".a4-boundary-line");
    a4BoundaryLines.forEach((line) => {
      line.style.display = "none";
    });
    const a4ContentBoundaries = clonedElement.querySelectorAll<HTMLElement>(".a4-content-boundary");
    a4ContentBoundaries.forEach((boundary) => {
      boundary.style.display = "none";
    });

    const [capturedStyles] = await Promise.all([
      getOptimizedStyles(),
      optimizeImages(clonedElement)
    ]);

    // 注入 PdfExport.tsx 中的样式增强
    const styles = `
      ${capturedStyles}
      html, body { background: white !important; background-color: white !important; }
      html, body, #${elementId} {
        background: white !important;
        background-color: white !important;
        font-family: ${selectedFontFamily} !important;
      }
    `;

    const payload = JSON.stringify({
      content: clonedElement.outerHTML,
      styles,
      margin,
    });

    const channels = resolveChannels(strategy);

    for (const channel of channels) {
      const url = resolveChannelUrl(channel);
      const mode: RequestMode = channel === "local" ? "same-origin" : "cors";

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: payload,
          mode,
          signal: AbortSignal.timeout(PDF_EXPORT_CONFIG.TIMEOUT)
        });

        if (!response.ok) {
          const parsedError = await parseErrorPayload(response);
          attempts.push({
            channel,
            url,
            ok: false,
            status: response.status,
            code: parsedError.code,
            message: parsedError.message,
          });
          continue;
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${title}.pdf`;
        link.click();
        window.URL.revokeObjectURL(blobUrl);

        attempts.push({
          channel,
          url,
          ok: true,
          status: response.status,
          message: "PDF generated successfully",
        });

        console.log(`Total export took ${performance.now() - exportStartTime}ms`);
        return {
          success: true,
          usedChannel: channel,
          attempts,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown export error";
        attempts.push({
          channel,
          url,
          ok: false,
          message,
        });
      }
    }
  } catch (error) {
    console.error("Export error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown export error";
    attempts.push({
      channel: "local",
      url: resolveChannelUrl("local"),
      ok: false,
      message,
    });
  } finally {
    onEnd?.();
  }

  const lastFailure = attempts
    .filter((attempt) => !attempt.ok)
    .slice(-1)[0];

  return {
    success: false,
    attempts,
    errorCode: lastFailure?.code,
    errorMessage: lastFailure?.message,
  };
};

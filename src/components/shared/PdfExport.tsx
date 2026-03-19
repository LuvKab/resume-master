import React, { useState } from "react";
import { useTranslations } from "@/i18n/compat/client";
import {
  Download,
  Loader2,
  FileJson,
  Printer,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import {
  exportToPdf,
  isVercelLocalPdfDisabled,
  PDF_LOCAL_DISABLED_ON_VERCEL,
  type ExportToPdfResult,
  type PdfExportChannel,
  type PdfExportStrategy
} from "@/utils/export";
import { exportResumeToBrowserPrint } from "@/utils/print";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const PdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [exportFailureOpen, setExportFailureOpen] = useState(false);
  const [exportFailureResult, setExportFailureResult] = useState<ExportToPdfResult | null>(null);
  const { activeResume } = useResumeStore();
  const { globalSettings = {}, title } = activeResume || {};
  const t = useTranslations("pdfExport");
  const tPreview = useTranslations("previewDock");

  const runPdfExport = async (strategy: PdfExportStrategy = "auto") => {
    const result = await exportToPdf({
      elementId: "resume-preview",
      title: title || "resume",
      fontFamily: globalSettings?.fontFamily,
      onStart: () => setIsExporting(true),
      onEnd: () => setIsExporting(false),
      strategy,
    });

    if (result.success) {
      toast.success(t("toast.success"));
      setExportFailureOpen(false);
      setExportFailureResult(null);
      return true;
    }

    toast.error(t("toast.error"));
    setExportFailureResult(result);
    setExportFailureOpen(true);
    return false;
  };

  const handleExport = async () => {
    await runPdfExport("auto");
  };

  const handleJsonExport = () => {
    try {
      setIsExportingJson(true);
      if (!activeResume) {
        throw new Error("No active resume");
      }

      const jsonStr = JSON.stringify(activeResume, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.json`;
      link.click();

      window.URL.revokeObjectURL(url);
      toast.success(t("toast.jsonSuccess"));
    } catch (error) {
      console.error("JSON export error:", error);
      toast.error(t("toast.jsonError"));
    } finally {
      setIsExportingJson(false);
    }
  };

  const handlePrint = async () => {
    const resumeContent = document.getElementById("resume-preview");
    if (!resumeContent) {
      console.error("Resume content not found");
      toast.error(tPreview("exportFailure.previewMissing"));
      return;
    }

    await exportResumeToBrowserPrint(
      resumeContent,
      undefined,
      globalSettings?.fontFamily
    );
  };

  const isLoading = isExporting || isExportingJson;
  const localExportDisabledOnVercel = isVercelLocalPdfDisabled(exportFailureResult);
  const exportFailedAttempts =
    exportFailureResult?.attempts.filter(
      (attempt) =>
        !attempt.ok && attempt.code !== PDF_LOCAL_DISABLED_ON_VERCEL
    ) || [];
  const channelLabel = (channel: PdfExportChannel) =>
    channel === "local"
      ? tPreview("exportFailure.localChannel")
      : tPreview("exportFailure.remoteChannel");
  const loadingText = isExporting
    ? t("button.exporting")
    : isExportingJson
      ? t("button.exportingJson")
      : "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{t("button.export")}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            {t("button.exportPdf")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint} disabled={isLoading}>
            <Printer className="w-4 h-4 mr-2" />
            {t("button.print")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleJsonExport} disabled={isLoading}>
            <FileJson className="w-4 h-4 mr-2" />
            {t("button.exportJson")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={exportFailureOpen} onOpenChange={setExportFailureOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{tPreview("exportFailure.title")}</DialogTitle>
            <DialogDescription>{tPreview("exportFailure.description")}</DialogDescription>
          </DialogHeader>
          {exportFailedAttempts.length > 0 && (
            <div className="rounded-md border border-border/80 bg-accent/20 px-3 py-2 space-y-2">
              {exportFailedAttempts.map((attempt, index) => (
                <div key={`${attempt.channel}-${index}`} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{channelLabel(attempt.channel)}:</span>{" "}
                  {attempt.message}
                </div>
              ))}
            </div>
          )}
          {localExportDisabledOnVercel && (
            <div className="text-xs text-muted-foreground">
              {tPreview("exportFailure.localDisabledOnVercel")}
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setExportFailureOpen(false)}
              disabled={isExporting}
            >
              {tPreview("exportFailure.cancel")}
            </Button>
            {!localExportDisabledOnVercel && (
              <Button
                variant="outline"
                onClick={() => void runPdfExport("local-only")}
                disabled={isExporting}
              >
                {tPreview("exportFailure.retryLocal")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => void runPdfExport("remote-only")}
              disabled={isExporting}
            >
              {tPreview("exportFailure.retryRemote")}
            </Button>
            <Button
              onClick={() => {
                setExportFailureOpen(false);
                void handlePrint();
              }}
            >
              {tPreview("exportFailure.usePrint")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfExport;

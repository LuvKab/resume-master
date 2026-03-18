import { useEffect, useState, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/compat/client";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { createMarkdownExit } from "markdown-exit";
import TurndownService from "turndown";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { cn } from "@/lib/utils";

interface AIPolishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onApply: (content: string) => void;
}

// markdown-exit 实例，用于将 AI 返回的 Markdown 转换为 Tiptap 兼容的 HTML
const md = createMarkdownExit({
  html: true,       // 允许 HTML 标签透传
  breaks: true,     // 将换行符转换为 <br>
  linkify: false,   // 简历内容不需要自动识别链接
});

// turndown 实例，用于将 Tiptap HTML 转换为 Markdown 发给 AI
const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
});

export default function AIPolishDialog({
  open,
  onOpenChange,
  content,
  onApply
}: AIPolishDialogProps) {
  const t = useTranslations("aiPolishDialog");
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedContent, setPolishedContent] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const {
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    geminiApiKey,
    geminiModelId,
    isConfigured
  } = useAIConfigStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const polishedContentRef = useRef<HTMLDivElement>(null);

  const handlePolish = async () => {
    try {
      if (!isConfigured()) {
        toast.error(t("error.configRequired"));
        onOpenChange(false);
        return;
      }

      setIsPolishing(true);
      setPolishedContent("");

      abortControllerRef.current = new AbortController();

      const config = AI_MODEL_CONFIGS[selectedModel];
      const apiKey =
        selectedModel === "doubao"
          ? doubaoApiKey
          : selectedModel === "openai"
            ? openaiApiKey
            : selectedModel === "gemini"
              ? geminiApiKey
              : deepseekApiKey;
      const modelId =
        selectedModel === "doubao"
          ? doubaoModelId
          : selectedModel === "openai"
            ? openaiModelId
            : selectedModel === "gemini"
              ? geminiModelId
              : deepseekModelId;

      const response = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: turndownService.turndown(content),
          apiKey,
          apiEndpoint: selectedModel === "openai" ? openaiApiEndpoint : undefined,
          model: config.requiresModelId ? modelId : config.defaultModel,
          modelType: selectedModel,
          customInstructions: customInstructions.trim() || undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error("Failed to polish content");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setPolishedContent((prev) => prev + chunk);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Polish aborted");
        return;
      }
      console.error("Polish error:", error);
      toast.error(t("error.polishFailed"));
      onOpenChange(false);
    } finally {
      setIsPolishing(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (polishedContent && polishedContentRef.current) {
      const container = polishedContentRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [polishedContent]);

  useEffect(() => {
    if (!open) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setPolishedContent("");
      setCustomInstructions("");
    }
  }, [open]);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    onOpenChange(false);
    setPolishedContent("");
  };

  const handleApply = () => {
    // 将 Markdown 转为 HTML，并补回 Tiptap 所需的 ul/ol 类名
    const htmlContent = md.render(polishedContent)
      .replace(/<ul>/g, '<ul class="custom-list">')
      .replace(/<ol>/g, '<ol class="custom-list-ordered">');
    onApply(htmlContent);
    handleClose();
    toast.success(t("error.applied"));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPolishing) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[1000px]",
          "bg-background",
          "border-border",
          "rounded-2xl shadow-2xl dark:shadow-none"
        )}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="pb-6">
          <DialogTitle
            className={cn(
              "flex items-center gap-2 text-2xl",
              "text-foreground"
            )}
          >
            <Sparkles
              className={cn(
                "h-6 w-6 text-q_acid animate-pulse"
              )}
            />
            {t("title")}
          </DialogTitle>
          <DialogDescription
            className={cn(
              "text-base",
              "text-muted-foreground"
            )}
          >
            {isPolishing
              ? t("description.polishing")
              : polishedContent
                ? t("description.finished")
                : t("description.ready")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label
            htmlFor="custom-instructions"
            className={cn(
              "text-sm font-medium",
              "text-muted-foreground"
            )}
          >
            {t("customInstructions")}
          </Label>
          <Textarea
            id="custom-instructions"
            placeholder={t("customInstructionsPlaceholder")}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            disabled={isPolishing}
            rows={2}
            className={cn(
              "resize-none rounded-xl border",
              "bg-background/80",
              "border-border",
              "text-foreground/90",
              "placeholder:text-muted-foreground"
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  "bg-q_graphite/70"
                )}
              ></div>
              <span
                className={cn(
                  "text-sm font-medium",
                  "text-muted-foreground"
                )}
              >
                {t("content.original")}
              </span>
            </div>
            <div
              className={cn(
                "relative rounded-xl border",
                "bg-background/80",
                "border-border",
                "p-6 h-[400px] overflow-auto shadow-sm"
              )}
            >
              <Streamdown
                className={cn(
                  "prose dark:prose-invert max-w-none",
                  "text-foreground/90"
                )}
              >
                {turndownService.turndown(content)}
              </Streamdown>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  "bg-primary animate-pulse"
                )}
              ></div>
              <span
                className={cn(
                  "text-sm font-medium",
                  "text-q_acid"
                )}
              >
                {t("content.polished")}
              </span>
            </div>
            <div
              ref={polishedContentRef}
              className={cn(
                "relative rounded-xl border",
                "bg-q_acid/5 dark:bg-q_acid/10",
                "border-q_acid/25",
                "p-6 h-[400px] overflow-auto shadow-sm scroll-smooth"
              )}
            >
              <Streamdown
                animated
                isAnimating={isPolishing}
                className={cn(
                  "prose dark:prose-invert max-w-none",
                  "text-foreground"
                )}
              >
                {polishedContent}
              </Streamdown>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center gap-3">
          <Button
            onClick={handlePolish}
            disabled={isPolishing}
            className="flex-1 bg-q_black hover:bg-q_acid text-q_bone border-none h-11 shadow-lg shadow-q_black/20"
          >
            {isPolishing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("button.generating")}
              </div>
            ) : !polishedContent ? (
              t("button.start")
            ) : (
              t("button.regenerate")
            )}
          </Button>

          <Button
            onClick={handleApply}
            disabled={!polishedContent || isPolishing}
            className="flex-1 bg-q_acid hover:bg-q_acid/90 text-q_bone h-11 shadow-lg shadow-q_acid/20"
          >
            {t("button.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

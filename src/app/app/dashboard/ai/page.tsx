import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Aperture,
  Bot,
  Check,
  Cpu,
  ExternalLink,
  Gem,
  Globe,
  Lightbulb,
  MessageCircle,
  MoonStar,
  Monitor,
  Server,
} from "lucide-react";
import { useTranslations } from "@/i18n/compat/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { cn } from "@/lib/utils";
import {
  AI_MODEL_CONFIGS,
  AI_PROVIDER_ORDER,
  AI_PROVIDER_REGISTRY,
  AIModelType,
  resolveAIProviderConfig,
} from "@/config/ai";

const providerIcons: Record<AIModelType, ComponentType<{ className?: string }>> =
  {
    deepseek: Bot,
    doubao: MessageCircle,
    openai: Aperture,
    gemini: Gem,
    qwen: MessageCircle,
    zhipu: Lightbulb,
    kimi: MoonStar,
    siliconflow: Cpu,
    ollama: Server,
    lmstudio: Monitor,
    customProxy: Globe,
  };

const AISettingsPage = () => {
  const { selectedModel, providerConfigs, setSelectedModel, setProviderConfig } =
    useAIConfigStore();
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const t = useTranslations();

  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  const providers = useMemo(
    () =>
      AI_PROVIDER_ORDER.map((providerId) => {
        const definition = AI_PROVIDER_REGISTRY[providerId];
        const resolvedConfig = resolveAIProviderConfig(
          providerId,
          providerConfigs[providerId]
        );

        return {
          id: providerId,
          name: t(`dashboard.settings.ai.${providerId}.title`),
          description: t(`dashboard.settings.ai.${providerId}.description`),
          docsUrl: definition.docsUrl,
          icon: providerIcons[providerId],
          meta: definition,
          resolvedConfig,
          rawConfig: providerConfigs[providerId],
          isConfigured: AI_MODEL_CONFIGS[providerId].validate(resolvedConfig),
        };
      }),
    [providerConfigs, t]
  );

  const currentProvider =
    providers.find((provider) => provider.id === currentModel) || providers[0];

  if (!currentProvider) {
    return null;
  }

  return (
    <div className="mx-auto py-4 px-4">
      <div className="flex gap-8">
        <div className="w-64 space-y-6">
          <div className="flex flex-col space-y-1.5">
            {providers.map((provider) => {
              const Icon = provider.icon;
              const isChecked = selectedModel === provider.id;
              const isViewing = currentModel === provider.id;

              return (
                <div
                  key={provider.id}
                  onClick={() => setCurrentModel(provider.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left border",
                    "transition-all duration-200 cursor-pointer",
                    "hover:bg-q_acid/10 hover:border-q_acid/30",
                    isViewing
                      ? "bg-q_acid/10 border-q_acid/40"
                      : "border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 h-6 w-6 flex items-center justify-center",
                      isViewing ? "text-q_black" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isViewing && "text-q_black"
                      )}
                    >
                      {provider.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {provider.isConfigured
                        ? t("common.configured")
                        : t("common.notConfigured")}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Select ${provider.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedModel(provider.id);
                      setCurrentModel(provider.id);
                    }}
                    className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center border transition-all",
                      "shrink-0",
                      isChecked
                        ? "bg-q_acid border-q_acid text-white"
                        : "bg-transparent border-muted-foreground/40 text-transparent hover:border-q_acid/40"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 max-w-2xl space-y-8">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <div className="shrink-0 text-q_black">
                <currentProvider.icon className="h-6 w-6" />
              </div>
              {currentProvider.name}
            </h2>
            <p className="mt-2 text-muted-foreground">{currentProvider.description}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {t(`dashboard.settings.ai.${currentProvider.id}.apiKey`)}
                </Label>
                <a
                  href={currentProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-q_acid flex items-center gap-1"
                >
                  {t("dashboard.settings.ai.getApiKey")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Input
                value={currentProvider.rawConfig?.apiKey || ""}
                onChange={(event) =>
                  setProviderConfig(currentProvider.id, {
                    apiKey: event.target.value,
                  })
                }
                type="password"
                placeholder={t(`dashboard.settings.ai.${currentProvider.id}.apiKey`)}
                className={cn(
                  "h-11",
                  "bg-background",
                  "border-border",
                  "focus:ring-2 focus:ring-q_acid/20"
                )}
              />
              {currentProvider.meta.allowEmptyApiKey && (
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.settings.ai.common.apiKeyOptionalHint")}
                </p>
              )}
            </div>

            {currentProvider.meta.showApiEndpointInput && (
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  {t("dashboard.settings.ai.common.apiEndpoint")}
                </Label>
                <Input
                  value={currentProvider.rawConfig?.apiEndpoint || ""}
                  onChange={(event) =>
                    setProviderConfig(currentProvider.id, {
                      apiEndpoint: event.target.value,
                    })
                  }
                  placeholder={
                    currentProvider.meta.defaultApiEndpoint ||
                    t("dashboard.settings.ai.common.apiEndpointPlaceholder")
                  }
                  className={cn(
                    "h-11",
                    "bg-background",
                    "border-border",
                    "focus:ring-2 focus:ring-q_acid/20"
                  )}
                />
              </div>
            )}

            {currentProvider.meta.showModelInput && (
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  {t("dashboard.settings.ai.common.modelId")}
                </Label>
                <Input
                  value={currentProvider.rawConfig?.modelId || ""}
                  onChange={(event) =>
                    setProviderConfig(currentProvider.id, {
                      modelId: event.target.value,
                    })
                  }
                  placeholder={
                    currentProvider.meta.defaultModel ||
                    t("dashboard.settings.ai.common.modelIdPlaceholder")
                  }
                  className={cn(
                    "h-11",
                    "bg-background",
                    "border-border",
                    "focus:ring-2 focus:ring-q_acid/20"
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const runtime = "edge";

export default AISettingsPage;

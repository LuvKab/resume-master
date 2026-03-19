import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AI_MODEL_CONFIGS,
  AI_PROVIDER_ORDER,
  AIModelType,
  AIProviderUserConfig,
  LEGACY_OPENAI_PRESET_TO_PROVIDER,
  SERVER_MANAGED_AI,
  createDefaultAIProviderConfigs,
  isAIModelType,
  resolveAIProviderConfig,
} from "@/config/ai";

interface AIConfigState {
  selectedModel: AIModelType;
  providerConfigs: Record<AIModelType, AIProviderUserConfig>;
  setSelectedModel: (model: AIModelType) => void;
  setProviderConfig: (
    providerId: AIModelType,
    updates: Partial<AIProviderUserConfig>
  ) => void;
  isConfigured: () => boolean;
}

const DEFAULT_SELECTED_MODEL: AIModelType = "doubao";

const normalizeProviderConfigs = (
  providerConfigs?: Partial<Record<AIModelType, Partial<AIProviderUserConfig>>>
) => {
  const defaults = createDefaultAIProviderConfigs();

  if (!providerConfigs) {
    return defaults;
  }

  for (const providerId of AI_PROVIDER_ORDER) {
    const current = providerConfigs[providerId] || {};
    defaults[providerId] = {
      apiKey: typeof current.apiKey === "string" ? current.apiKey : "",
      apiEndpoint: typeof current.apiEndpoint === "string" ? current.apiEndpoint : "",
      modelId: typeof current.modelId === "string" ? current.modelId : "",
    };
  }

  return defaults;
};

const migrateLegacyState = (persistedState: any) => {
  const providerConfigs = createDefaultAIProviderConfigs();
  const legacyOpenaiConfig = {
    apiKey: persistedState?.openaiApiKey || "",
    apiEndpoint: persistedState?.openaiApiEndpoint || "",
    modelId: persistedState?.openaiModelId || "",
  };

  providerConfigs.deepseek = {
    ...providerConfigs.deepseek,
    apiKey: persistedState?.deepseekApiKey || "",
    modelId: persistedState?.deepseekModelId || "",
  };
  providerConfigs.doubao = {
    ...providerConfigs.doubao,
    apiKey: persistedState?.doubaoApiKey || "",
    modelId: persistedState?.doubaoModelId || "",
  };
  providerConfigs.openai = {
    ...providerConfigs.openai,
    ...legacyOpenaiConfig,
  };
  providerConfigs.gemini = {
    ...providerConfigs.gemini,
    apiKey: persistedState?.geminiApiKey || "",
    modelId: persistedState?.geminiModelId || "",
  };

  const legacyPresetId = persistedState?.openaiProviderPresetId;
  const mappedProviderFromPreset =
    typeof legacyPresetId === "string"
      ? LEGACY_OPENAI_PRESET_TO_PROVIDER[legacyPresetId]
      : undefined;

  if (mappedProviderFromPreset) {
    providerConfigs[mappedProviderFromPreset] = {
      ...providerConfigs[mappedProviderFromPreset],
      ...legacyOpenaiConfig,
    };
  }

  const rawSelectedModel = persistedState?.selectedModel;
  let selectedModel: AIModelType = DEFAULT_SELECTED_MODEL;

  if (typeof rawSelectedModel === "string" && isAIModelType(rawSelectedModel)) {
    selectedModel = rawSelectedModel;
  }

  if (selectedModel === "openai" && mappedProviderFromPreset) {
    selectedModel = mappedProviderFromPreset;
  }

  return {
    ...persistedState,
    selectedModel,
    providerConfigs,
  };
};

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      selectedModel: DEFAULT_SELECTED_MODEL,
      providerConfigs: createDefaultAIProviderConfigs(),
      setSelectedModel: (model: AIModelType) => set({ selectedModel: model }),
      setProviderConfig: (
        providerId: AIModelType,
        updates: Partial<AIProviderUserConfig>
      ) =>
        set((state) => ({
          providerConfigs: {
            ...state.providerConfigs,
            [providerId]: {
              ...state.providerConfigs[providerId],
              ...updates,
            },
          },
        })),
      isConfigured: () => {
        if (SERVER_MANAGED_AI) {
          return true;
        }

        const state = get();
        const selectedProvider = state.selectedModel;
        const config = AI_MODEL_CONFIGS[selectedProvider];
        const resolvedConfig = resolveAIProviderConfig(
          selectedProvider,
          state.providerConfigs[selectedProvider]
        );
        return config.validate(resolvedConfig);
      },
    }),
    {
      name: "ai-config-storage",
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return {
            selectedModel: DEFAULT_SELECTED_MODEL,
            providerConfigs: createDefaultAIProviderConfigs(),
          };
        }

        if (version < 2) {
          return migrateLegacyState(persistedState);
        }

        const typedState = persistedState as {
          selectedModel?: string;
          providerConfigs?: Partial<
            Record<AIModelType, Partial<AIProviderUserConfig>>
          >;
        };

        return {
          ...persistedState,
          selectedModel:
            typeof typedState.selectedModel === "string" &&
            isAIModelType(typedState.selectedModel)
              ? typedState.selectedModel
              : DEFAULT_SELECTED_MODEL,
          providerConfigs: normalizeProviderConfigs(typedState.providerConfigs),
        };
      },
    }
  )
);

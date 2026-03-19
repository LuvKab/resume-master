export type AIModelType =
  | "deepseek"
  | "doubao"
  | "openai"
  | "gemini"
  | "qwen"
  | "zhipu"
  | "kimi"
  | "siliconflow"
  | "ollama"
  | "lmstudio"
  | "customProxy";

export type AIRuntimeType =
  | "deepseek"
  | "doubao"
  | "gemini"
  | "openai_compatible";

export const SERVER_MANAGED_AI = import.meta.env.VITE_SERVER_MANAGED_AI === "true";

export interface AIProviderDefinition {
  id: AIModelType;
  runtime: AIRuntimeType;
  docsUrl: string;
  defaultApiEndpoint: string;
  defaultModel: string;
  showApiEndpointInput: boolean;
  showModelInput: boolean;
  allowEmptyApiKey: boolean;
}

export interface AIProviderUserConfig {
  apiKey: string;
  apiEndpoint: string;
  modelId: string;
}

export interface AIResolvedProviderConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  apiKeyOptional: boolean;
}

export const AI_PROVIDER_ORDER: AIModelType[] = [
  "deepseek",
  "doubao",
  "openai",
  "gemini",
  "qwen",
  "zhipu",
  "kimi",
  "siliconflow",
  "ollama",
  "lmstudio",
  "customProxy",
];

export const AI_PROVIDER_REGISTRY: Record<AIModelType, AIProviderDefinition> = {
  deepseek: {
    id: "deepseek",
    runtime: "deepseek",
    docsUrl: "https://platform.deepseek.com",
    defaultApiEndpoint: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  doubao: {
    id: "doubao",
    runtime: "doubao",
    docsUrl: "https://console.volcengine.com/ark",
    defaultApiEndpoint: "https://ark.cn-beijing.volces.com/api/v3",
    defaultModel: "doubao-seed-1-6-250615",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  openai: {
    id: "openai",
    runtime: "openai_compatible",
    docsUrl: "https://platform.openai.com/api-keys",
    defaultApiEndpoint: "https://api.openai.com/v1",
    defaultModel: "gpt-4.1-mini",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  gemini: {
    id: "gemini",
    runtime: "gemini",
    docsUrl: "https://aistudio.google.com/app/apikey",
    defaultApiEndpoint: "",
    defaultModel: "gemini-flash-latest",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  qwen: {
    id: "qwen",
    runtime: "openai_compatible",
    docsUrl: "https://dashscope.aliyun.com",
    defaultApiEndpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-plus",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  zhipu: {
    id: "zhipu",
    runtime: "openai_compatible",
    docsUrl: "https://open.bigmodel.cn",
    defaultApiEndpoint: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4-flash",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  kimi: {
    id: "kimi",
    runtime: "openai_compatible",
    docsUrl: "https://platform.moonshot.cn",
    defaultApiEndpoint: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  siliconflow: {
    id: "siliconflow",
    runtime: "openai_compatible",
    docsUrl: "https://siliconflow.cn",
    defaultApiEndpoint: "https://api.siliconflow.cn/v1",
    defaultModel: "Qwen/Qwen2.5-7B-Instruct",
    showApiEndpointInput: false,
    showModelInput: false,
    allowEmptyApiKey: false,
  },
  ollama: {
    id: "ollama",
    runtime: "openai_compatible",
    docsUrl: "https://ollama.com",
    defaultApiEndpoint: "http://127.0.0.1:11434/v1",
    defaultModel: "qwen2.5:7b",
    showApiEndpointInput: true,
    showModelInput: false,
    allowEmptyApiKey: true,
  },
  lmstudio: {
    id: "lmstudio",
    runtime: "openai_compatible",
    docsUrl: "https://lmstudio.ai",
    defaultApiEndpoint: "http://127.0.0.1:1234/v1",
    defaultModel: "local-model",
    showApiEndpointInput: true,
    showModelInput: false,
    allowEmptyApiKey: true,
  },
  customProxy: {
    id: "customProxy",
    runtime: "openai_compatible",
    docsUrl: "https://platform.openai.com/docs/api-reference/chat",
    defaultApiEndpoint: "",
    defaultModel: "",
    showApiEndpointInput: true,
    showModelInput: true,
    allowEmptyApiKey: false,
  },
};

export const LEGACY_OPENAI_PRESET_TO_PROVIDER: Record<string, AIModelType> = {
  openai_official: "openai",
  deepseek_official: "deepseek",
  doubao_ark: "doubao",
  qwen_dashscope: "qwen",
  zhipu_glm: "zhipu",
  kimi_moonshot: "kimi",
  siliconflow: "siliconflow",
  ollama_local: "ollama",
  lmstudio_local: "lmstudio",
  custom_compatible: "customProxy",
};

export const DEFAULT_AI_PROVIDER_CONFIG: AIProviderUserConfig = {
  apiKey: "",
  apiEndpoint: "",
  modelId: "",
};

export const createDefaultAIProviderConfigs = (): Record<AIModelType, AIProviderUserConfig> =>
  AI_PROVIDER_ORDER.reduce((acc, providerId) => {
    acc[providerId] = { ...DEFAULT_AI_PROVIDER_CONFIG };
    return acc;
  }, {} as Record<AIModelType, AIProviderUserConfig>);

export const isAIModelType = (value: string): value is AIModelType =>
  AI_PROVIDER_ORDER.includes(value as AIModelType);

export const normalizeOpenAICompatibleEndpoint = (endpoint?: string) => {
  const normalized = (endpoint || "").trim();
  if (!normalized) return "";
  return normalized
    .replace(/\/+$/, "")
    .replace(/\/chat\/completions$/i, "")
    .replace(/\/completions$/i, "");
};

export const resolveAIProviderConfig = (
  providerId: AIModelType,
  userConfig?: Partial<AIProviderUserConfig>
): AIResolvedProviderConfig => {
  const provider = AI_PROVIDER_REGISTRY[providerId];
  const apiEndpoint =
    provider.runtime === "openai_compatible"
      ? normalizeOpenAICompatibleEndpoint(
          userConfig?.apiEndpoint || provider.defaultApiEndpoint
        )
      : "";

  return {
    apiKey: (userConfig?.apiKey || "").trim(),
    apiEndpoint,
    model: (userConfig?.modelId || provider.defaultModel || "").trim(),
    apiKeyOptional: provider.allowEmptyApiKey,
  };
};

export interface AIValidationContext {
  apiKey?: string;
  model?: string;
  apiEndpoint?: string;
  apiKeyOptional?: boolean;
}

export interface AIModelConfig {
  url: (endpoint?: string) => string;
  requiresModelId: boolean;
  defaultModel?: string;
  headers: (apiKey: string) => Record<string, string>;
  validate: (context: AIValidationContext) => boolean;
}

const buildOpenAICompatibleConfig = (
  defaultEndpoint: string,
  defaultModel: string,
  allowEmptyApiKey = false
): AIModelConfig => ({
  url: (endpoint?: string) =>
    `${normalizeOpenAICompatibleEndpoint(endpoint || defaultEndpoint)}/chat/completions`,
  requiresModelId: true,
  defaultModel,
  headers: (apiKey: string) => ({
    "Content-Type": "application/json",
    ...(apiKey?.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
  }),
  validate: (context: AIValidationContext) =>
    !!(
      context.model?.trim() &&
      normalizeOpenAICompatibleEndpoint(context.apiEndpoint || defaultEndpoint) &&
      (allowEmptyApiKey || context.apiKeyOptional || context.apiKey?.trim())
    ),
});

export const AI_MODEL_CONFIGS: Record<AIModelType, AIModelConfig> = {
  deepseek: {
    url: () => "https://api.deepseek.com/v1/chat/completions",
    requiresModelId: false,
    defaultModel: AI_PROVIDER_REGISTRY.deepseek.defaultModel,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      ...(apiKey?.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
    }),
    validate: (context: AIValidationContext) => !!context.apiKey?.trim(),
  },
  doubao: {
    url: () => "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    requiresModelId: true,
    defaultModel: AI_PROVIDER_REGISTRY.doubao.defaultModel,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      ...(apiKey?.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {}),
    }),
    validate: (context: AIValidationContext) =>
      !!(context.apiKey?.trim() && context.model?.trim()),
  },
  openai: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.openai.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.openai.defaultModel
  ),
  qwen: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.qwen.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.qwen.defaultModel
  ),
  zhipu: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.zhipu.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.zhipu.defaultModel
  ),
  kimi: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.kimi.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.kimi.defaultModel
  ),
  siliconflow: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.siliconflow.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.siliconflow.defaultModel
  ),
  ollama: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.ollama.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.ollama.defaultModel,
    true
  ),
  lmstudio: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.lmstudio.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.lmstudio.defaultModel,
    true
  ),
  customProxy: buildOpenAICompatibleConfig(
    AI_PROVIDER_REGISTRY.customProxy.defaultApiEndpoint,
    AI_PROVIDER_REGISTRY.customProxy.defaultModel
  ),
  gemini: {
    url: () => "https://generativelanguage.googleapis.com/v1beta",
    requiresModelId: true,
    defaultModel: AI_PROVIDER_REGISTRY.gemini.defaultModel,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    }),
    validate: (context: AIValidationContext) =>
      !!(context.apiKey?.trim() && context.model?.trim()),
  },
};

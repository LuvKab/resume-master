import { AIModelType } from "@/config/ai";

type RequestPayload = {
  modelType?: AIModelType;
  apiKey?: string;
  model?: string;
  apiEndpoint?: string;
};

const SUPPORTED_MODELS: AIModelType[] = [
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

function normalizeModelType(modelType?: string): AIModelType {
  if (modelType && SUPPORTED_MODELS.includes(modelType as AIModelType)) {
    return modelType as AIModelType;
  }

  const fallback = process.env.DEFAULT_AI_MODEL;
  if (fallback && SUPPORTED_MODELS.includes(fallback as AIModelType)) {
    return fallback as AIModelType;
  }

  return "openai";
}

function envForModel(modelType: AIModelType) {
  switch (modelType) {
    case "doubao":
      return {
        apiKey: process.env.DOUBAO_API_KEY,
        model: process.env.DOUBAO_MODEL_ID
      };
    case "deepseek":
      return {
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: process.env.DEEPSEEK_MODEL_ID
      };
    case "openai":
    case "qwen":
    case "zhipu":
    case "kimi":
    case "siliconflow":
    case "ollama":
    case "lmstudio":
    case "customProxy":
      return {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL_ID,
        apiEndpoint: process.env.OPENAI_API_ENDPOINT
      };
    case "gemini":
      return {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL_ID
      };
    default:
      return {};
  }
}

export function resolveAIRequest(payload: RequestPayload) {
  const modelType = normalizeModelType(payload.modelType);
  const env = envForModel(modelType);

  return {
    modelType,
    apiKey: payload.apiKey || env.apiKey || "",
    model: payload.model || env.model || "",
    apiEndpoint: payload.apiEndpoint || env.apiEndpoint || ""
  };
}

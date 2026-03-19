import { createFileRoute } from "@tanstack/react-router";
import {
  AIModelType,
  AI_MODEL_CONFIGS,
  resolveAIProviderConfig,
} from "@/config/ai";
import { formatGeminiErrorMessage, getGeminiModelInstance } from "@/lib/server/gemini";
import { createOpenAICompatibleTextStream } from "@/lib/server/openai-compatible-stream";
import { buildResumePolishPrompt } from "@/lib/server/prompts/resume-polish";

export const Route = createFileRoute("/api/polish")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            apiKey,
            model,
            content,
            modelType,
            apiEndpoint,
            customInstructions,
          } = body as {
            apiKey: string;
            model: string;
            content: string;
            modelType: AIModelType;
            apiEndpoint?: string;
            customInstructions?: string;
          };

          const modelConfig = AI_MODEL_CONFIGS[modelType as AIModelType];
          if (!modelConfig) {
            throw new Error("Invalid model type");
          }
          const resolvedConfig = resolveAIProviderConfig(modelType, {
            apiKey,
            apiEndpoint,
            modelId: model,
          });

          const systemPrompt = buildResumePolishPrompt(customInstructions);

          if (modelType === "gemini") {
            const geminiModel =
              resolvedConfig.model || modelConfig.defaultModel || "gemini-flash-latest";
            const modelInstance = getGeminiModelInstance({
              apiKey: resolvedConfig.apiKey,
              model: geminiModel,
              systemInstruction: systemPrompt,
              generationConfig: {
                temperature: 0.4,
              },
            });

            const encoder = new TextEncoder();

            const stream = new ReadableStream({
              async start(controller) {
                try {
                  const result = await modelInstance.generateContentStream(content);
                  for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    if (chunkText) {
                      controller.enqueue(encoder.encode(chunkText));
                    }
                  }
                } catch (error) {
                  controller.error(error);
                  return;
                }
                controller.close();
              },
            });

            return new Response(stream, {
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
              }
            });
          }

          const response = await fetch(modelConfig.url(resolvedConfig.apiEndpoint), {
            method: "POST",
            headers: modelConfig.headers(resolvedConfig.apiKey || ""),
            body: JSON.stringify({
              model: modelConfig.requiresModelId
                ? resolvedConfig.model || modelConfig.defaultModel
                : modelConfig.defaultModel,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content
                }
              ],
              stream: true
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Polish request failed (${response.status}): ${errorText || "Unknown error"}`
            );
          }

          const stream = createOpenAICompatibleTextStream(response);

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
              Connection: "keep-alive"
            }
          });
        } catch (error) {
          console.error("Polish error:", error);
          return Response.json(
            { error: formatGeminiErrorMessage(error) },
            { status: 500 }
          );
        }
      }
    }
  }
});

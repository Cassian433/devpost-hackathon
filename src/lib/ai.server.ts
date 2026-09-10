import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

function getConfiguration() {
  const provider = process.env["AI_PROVIDER"] ??
    (process.env["ANTHROPIC_API_KEY"] ? "anthropic" :
      process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ? "google" : undefined);
  if (!provider) {
    throw new Error("AI tutor is not configured. Set ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env (see .env.example).");
  }
  if (provider !== "anthropic" && provider !== "google") {
    throw new Error('AI_PROVIDER must be "anthropic" or "google".');
  }
  const modelId = process.env["AI_MODEL"] ??
    (provider === "anthropic" ? "claude-sonnet-5" : "gemini-3.7-flash");
  return { provider, modelId };
}

export function getModel(): LanguageModel {
  const { provider, modelId } = getConfiguration();
  const apiKey = process.env[provider === "anthropic" ? "ANTHROPIC_API_KEY" : "GOOGLE_GENERATIVE_AI_API_KEY"];
  if (!apiKey) {
    throw new Error("AI tutor is not configured. Set ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env (see .env.example).");
  }
  return provider === "anthropic"
    ? createAnthropic({ apiKey })(modelId)
    : createGoogleGenerativeAI({ apiKey })(modelId);
}

export function getProviderLabel(): string {
  const { provider, modelId } = getConfiguration();
  return `${provider}/${modelId}`;
}

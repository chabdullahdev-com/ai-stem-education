import { AIProvider, ProviderChatRequest, ProviderChatResponse, ProviderError } from "./provider";

/**
 * Ollama provider — the single place that knows about Ollama's HTTP API,
 * URL, and error shapes. The rest of the application is Ollama-free.
 *
 * Configuration (all optional overrides):
 *   OLLAMA_BASE_URL — defaults to http://localhost:11434
 *   GEMMA_MODEL     — defaults to gemma2:2b
 */

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "gemma2:2b";

// Ollama's chat endpoint (non-streaming).
const CHAT_PATH = "/api/chat";

/* -----------------------------------------------------------------------
 * Helper: get the model name from the environment.
 * ----------------------------------------------------------------------- */
export function getGemmaModel(): string {
  // On the server, process.env is available.
  if (typeof process !== "undefined" && process.env.GEMMA_MODEL) {
    return process.env.GEMMA_MODEL;
  }
  return DEFAULT_MODEL;
}

/* -----------------------------------------------------------------------
 * Helper: get the Ollama base URL from the environment.
 * ----------------------------------------------------------------------- */
export function getOllamaBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.OLLAMA_BASE_URL) {
    return process.env.OLLAMA_BASE_URL.replace(/\/+$/, ""); // strip trailing slash
  }
  return DEFAULT_BASE_URL;
}

/**
 * Wraps fetch with a timeout so hanging connections don't block the UI
 * indefinitely.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/* -----------------------------------------------------------------------
 * OllamaProvider
 * ----------------------------------------------------------------------- */

export class OllamaProvider implements AIProvider {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? getOllamaBaseUrl();
  }

  async chatReply(request: ProviderChatRequest): Promise<ProviderChatResponse> {
    const timeoutMs = request.options?.timeout ?? 30_000;
    const url = `${this.baseUrl}${CHAT_PATH}`;

    let res: Response;
    try {
      res = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            stream: false,
            options: {
              temperature: request.options?.temperature,
              num_predict: request.options?.num_predict,
            },
          }),
        },
        timeoutMs,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ProviderError(
          "Request timed out waiting for the AI model.",
          "timeout",
        );
      }
      // Connection refused, DNS failure, etc.
      throw new ProviderError(
        "Cannot reach the local AI server. Is Ollama running?",
        "connection",
      );
    }

    if (!res.ok) {
      // Ollama returns error details in JSON when the model is not found, etc.
      let detail = "";
      try {
        const body = await res.json();
        detail = body?.error ?? "";
      } catch {
        /* ignore unparseable error body */
      }
      throw new ProviderError(
        `AI server error (${res.status}). ${detail}`.trim(),
        res.status === 404 ? "model_not_found" : "unknown",
      );
    }

    let data: Record<string, unknown>;
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      throw new ProviderError(
        "Received an unreadable response from the AI server.",
        "unknown",
      );
    }

    const message = data.message as { role?: string; content?: string } | undefined;
    if (!message || !message.content) {
      throw new ProviderError(
        "The AI model returned an empty response.",
        "empty_response",
      );
    }

    return {
      message: { role: "assistant", content: message.content },
      done: true,
    };
  }
}

/**
 * Singleton factory — used by the API route so there's one provider per
 * process (lightweight; no persistent connections in Ollama's HTTP model).
 */
let _defaultProvider: OllamaProvider | null = null;
export function getDefaultProvider(): OllamaProvider {
  if (!_defaultProvider) {
    _defaultProvider = new OllamaProvider();
  }
  return _defaultProvider;
}

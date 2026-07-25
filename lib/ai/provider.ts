/**
 * AI provider abstraction layer.
 *
 * The rest of the application codes against this interface — never directly
 * against Ollama, its HTTP API, or any other specific AI runtime.
 *
 * To swap runtimes, implement a new class / object satisfying this interface
 * and wire it into the API route handler. No other files need to change.
 */

/* -----------------------------------------------------------------------
 * Message types (provider-level)
 * ----------------------------------------------------------------------- */

export interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderChatRequest {
  model: string;
  messages: ProviderMessage[];
  stream: false;
  options?: {
    temperature?: number;
    num_predict?: number;
    /** Max wall-clock ms for the provider call. */
    timeout?: number;
  };
}

export interface ProviderChatResponse {
  message: ProviderMessage;
  done: boolean;
}

/* -----------------------------------------------------------------------
 * Error taxonomy (used by the API route to map provider errors to
 * user-friendly messages)
 * ----------------------------------------------------------------------- */

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly kind: "connection" | "timeout" | "model_not_found" | "empty_response" | "unknown",
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/* -----------------------------------------------------------------------
 * AIProvider interface
 * ----------------------------------------------------------------------- */

/**
 * Core AI provider. Methods expand in future parts as assessment, experiment
 * validation, etc. arrive; for Part 2B only `chatReply` is exercised.
 */
export interface AIProvider {
  /**
   * Send a conversation to the model and receive its next assistant reply.
   * The caller is responsible for building the full message array including
   * the system prompt and history.
   */
  chatReply(request: ProviderChatRequest): Promise<ProviderChatResponse>;
}

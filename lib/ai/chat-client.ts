import type { ChatRequest, ChatResponse } from "./chat-types";

/**
 * Provider-agnostic chat client.
 *
 * The UI calls this function — it never talks to Ollama / Gemma directly.
 * It POSTs to the local API route (`/api/ai/chat`), which is the server-side
 * layer that actually talks to the AI runtime.
 *
 * To swap AI runtimes (Ollama → something else), replace the API route
 * handler — this client does not need to change.
 */

export const AI_CHAT_ENDPOINT = "/api/ai/chat";

/**
 * Send a chat request to the Gemma STEM instructor.
 * Returns the assistant's reply text. Throws on network or server errors;
 * the calling UI is responsible for surfacing the error state to the student.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50_000); // generous client-side timeout

  let res: Response;
  try {
    res = await fetch(AI_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("The request timed out.");
    }
    throw new Error("Cannot reach the AI service. Please check your connection.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // Try to extract a user-friendly error from the API response.
    let detail = "The AI service is currently unavailable.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = body.error;
    } catch {
      /* ignore unparseable error body */
    }
    throw new Error(detail);
  }

  return (await res.json()) as ChatResponse;
}

export type ChatClient = typeof sendChatMessage;

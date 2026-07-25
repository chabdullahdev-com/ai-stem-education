import type { ChatRequest, ChatResponse, LessonChatContext } from "./chat-types";

/**
 * Provider-agnostic chat client.
 *
 * The UI calls this function — it never talks to Ollama / Gemma directly.
 * The real AI integration (a later part) will:
 *   1. Implement the `POST /api/ai/chat` route handler (which talks to
 *      Ollama / local Gemma), and
 *   2. Replace the `SIMULATED` body below with a real `fetch` to that route.
 *
 * Until then, this stub runs a short simulation so the chat UI can be built
 * and verified end-to-end. The simulation:
 *   - Succeeds after a short delay (exercises the thinking / success states).
 *   - Throws when the latest user message contains the trigger word "error"
 *     (exercises the error state — a deterministic, documented test path).
 */

export const AI_CHAT_ENDPOINT = "/api/ai/chat";

const SIM_MIN_DELAY_MS = 700;
const SIM_MAX_DELAY_MS = 1300;
const ERROR_TRIGGER = /\berror\b/i;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function buildSimulatedReply(context: LessonChatContext): string {
  const groupAdaptation =
    context.studentAge <= 7
      ? "Let's keep it simple and fun."
      : context.studentAge <= 12
        ? "I'll keep it hands-on and clear."
        : "I'll go a bit deeper since you're ready for it.";

  return (
    `Hi ${context.studentName}! Great question about "${context.stepTitle}". ` +
    `${groupAdaptation} ` +
    `(Live AI isn't wired up yet — Gemma's real answers arrive when the backend is connected.)`
  );
}

/**
 * Send a chat request. Throws on failure — the UI is responsible for
 * surfacing the error state. Replace the simulated body with a real fetch
 * to `AI_CHAT_ENDPOINT` when the backend exists.
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const lastUser = [...request.messages].reverse().find((m) => m.role === "user");

  // ─── Part 2A simulation ───────────────────────────────────────────────
  // Deterministic error trigger so the error state can be tested by typing
  // a message containing the word "error".
  if (lastUser && ERROR_TRIGGER.test(lastUser.text)) {
    await delay(450);
    // The surfaced message is generic; the internal marker only helps the UI.
    throw new Error("SIMULATED_UNAVAILABLE");
  }

  await delay(SIM_MIN_DELAY_MS + Math.random() * (SIM_MAX_DELAY_MS - SIM_MIN_DELAY_MS));
  return { text: buildSimulatedReply(request.context) };
  // ─── End simulation ───────────────────────────────────────────────────

  // ─── Real integration (uncomment when /api/ai/chat exists) ─────────────
  // const res = await fetch(AI_CHAT_ENDPOINT, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(request),
  // });
  // if (!res.ok) {
  //   throw new Error(`AI chat request failed: ${res.status}`);
  // }
  // return (await res.json()) as ChatResponse;
  // ──────────────────────────────────────────────────────────────────────
}

export type ChatClient = typeof sendChatMessage;
import { NextResponse } from "next/server";
import type { ChatRequest, ChatResponse } from "@/lib/ai/chat-types";
import type { ProviderMessage } from "@/lib/ai/provider";
import { getGemmaModel, getDefaultProvider } from "@/lib/ai/ollama-provider";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { ProviderError } from "@/lib/ai/provider";

/**
 * POST /api/ai/chat
 *
 * Server-side AI route — the ONLY place the browser talks to for AI.
 * Frontend → this route → Ollama provider → local Gemma model.
 *
 * No Ollama details ever reach the browser. No stack traces reach the user.
 */

function toErrorMessage(kind: ProviderError["kind"]): string {
  switch (kind) {
    case "connection":
      return "Cannot reach the local AI server. Is Ollama running?";
    case "timeout":
      return "The AI model took too long to respond. Please try a shorter question or check if the model is loaded.";
    case "model_not_found":
      return "The AI model is not installed. Run 'ollama pull' to download it.";
    case "empty_response":
      return "The AI model returned an empty response. Please try again.";
    default:
      return "An unexpected error occurred with the AI server. Please try again.";
  }
}

function buildProviderMessages(
  systemPrompt: string,
  history: ChatRequest["messages"],
): ProviderMessage[] {
  const providerMessages: ProviderMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const m of history) {
    providerMessages.push({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.text,
    });
  }

  return providerMessages;
}

/** Basic validation — reject obviously malformed requests. */
function validateRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }
  const req = body as Record<string, unknown>;
  if (!req.context || typeof req.context !== "object") {
    throw new Error("Missing required field: context");
  }
  if (!Array.isArray(req.messages)) {
    throw new Error("Missing required field: messages");
  }
  return body as ChatRequest;
}

export async function POST(request: Request): Promise<NextResponse<ChatResponse | { error: string }>> {
  let chatRequest: ChatRequest;
  try {
    chatRequest = validateRequest(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please check the request format." },
      { status: 400 },
    );
  }

  const systemPrompt = buildSystemPrompt(chatRequest.context);
  const providerMessages = buildProviderMessages(systemPrompt, chatRequest.messages);
  const model = getGemmaModel();

  try {
    const provider = getDefaultProvider();
    const response = await provider.chatReply({
      model,
      messages: providerMessages,
      stream: false,
      options: { timeout: 45_000 },
    });

    return NextResponse.json<ChatResponse>({
      text: response.message.content,
    });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json(
        { error: toErrorMessage(err.kind) },
        { status: err.kind === "connection" ? 503 : 500 },
      );
    }
    // Unexpected — never leak raw error details to the client.
    console.error("Unhandled error in /api/ai/chat:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

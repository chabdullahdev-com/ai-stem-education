import type { AgeGroupId, LessonStepKind } from "@/lib/types";

/**
 * Chat message model shared between the UI and the future AI backend.
 * Kept here so the chat UI stays independent from any specific AI provider
 * (Ollama, local Gemma, etc.).
 */

export type ChatRole = "user" | "assistant";
export type ChatMessageStatus = "success" | "pending" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  status: ChatMessageStatus;
  /** Epoch milliseconds. */
  createdAt: number;
  /** Present only on error bubbles. */
  errorMessage?: string;
}

/**
 * Everything the future AI backend needs to adapt responses to the learner.
 * The UI builds this from the student profile + the active lesson/step, but
 * does NOT display it to the student (kept internal to the request).
 */
export interface LessonChatContext {
  studentName: string;
  studentAge: number;
  ageGroupId: AgeGroupId;
  ageGroupLabel: string;
  lessonTitle: string;
  lessonSlug: string;
  stepTitle: string;
  stepKind: LessonStepKind;
  /** 0-based index of the active step within the lesson. */
  stepIndex: number;
  /** Structured knowledge Gemma uses to teach — key facts, sensor details, etc. */
  lessonKnowledge?: string;
}

export interface ChatRequest {
  context: LessonChatContext;
  /**
   * Full conversation history, including the newest user message as the last
   * element. The assistant reply is returned separately.
   */
  messages: ChatMessage[];
}

export interface ChatResponse {
  text: string;
}
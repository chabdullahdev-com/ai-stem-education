"use client";

import { useCallback, useState } from "react";
import type { AssessmentLog } from "./types";

/**
 * Assessment state tracking hook.
 *
 * Records per-question state: correct/incorrect, attempts, hints, understandingLevel.
 * Supports adaptive remediation: wrong answers don't fail immediately, they prompt
 * Gemma for a re-explanation and a retry.
 */
export function useAssessmentState() {
  const [logs, setLogs] = useState<AssessmentLog[]>([]);
  const [understandingLevel, setUnderstandingLevel] = useState<"High" | "Medium" | "Low">("Medium");
  const [hintsRequested, setHintsRequested] = useState(0);

  const recordAnswer = useCallback((entry: Omit<AssessmentLog, "attempts" | "hintsRequested"> & { attempts?: number; hintsRequested?: number }) => {
    setLogs((prev) => {
      const existingIndex = prev.findIndex((l) => l.questionId === entry.questionId);
      if (existingIndex >= 0) {
        // Update existing log (retry)
        const existing = prev[existingIndex];
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          correct: entry.correct ?? existing.correct,
          attempts: (entry.attempts ?? existing.attempts + 1),
          hintsRequested: entry.hintsRequested ?? existing.hintsRequested,
          understandingLevel: entry.understandingLevel ?? existing.understandingLevel,
          studentAnswer: entry.studentAnswer ?? existing.studentAnswer,
        };
        return updated;
      }
      return [...prev, {
        ...entry,
        attempts: entry.attempts ?? 1,
        hintsRequested: entry.hintsRequested ?? 0,
      }];
    });
  }, []);

  const recordHintRequest = useCallback(() => {
    setHintsRequested((h) => h + 1);
  }, []);

  const recordUnderstanding = useCallback((level: "High" | "Medium" | "Low") => {
    setUnderstandingLevel(level);
  }, []);

  const reset = useCallback(() => {
    setLogs([]);
    setUnderstandingLevel("Medium");
    setHintsRequested(0);
  }, []);

  return {
    logs,
    understandingLevel,
    hintsRequested,
    recordAnswer,
    recordHintRequest,
    recordUnderstanding,
    reset,
  };
}
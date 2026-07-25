"use client";

import { useCallback, useMemo, useState } from "react";
import type { Lesson, LessonStepStatus } from "@/lib/types";

export interface LessonProgressState {
  lesson: Lesson;
  currentStepIndex: number; // 0-based index of the active step
  completedSteps: Set<string>; // step ids whose completion was recorded
}

export interface LessonProgressApi extends LessonProgressState {
  totalSteps: number;
  completedCount: number;
  fraction: number; // 0..1
  statusFor: (stepIndex: number) => LessonStepStatus;
  goToStep: (index: number) => void;
  recordCompletion: (stepId: string) => void;
}

/**
 * Owns lesson progress state for a single session.
 *
 * Completion policy (Part 1):
 *  - Real completion logic for content/experiment/check/assessment steps is
 *    implemented in future parts. We do NOT fake completion here.
 *  - Only an explicit `recordCompletion` call marks a step done. Part 1 does
 *    not call this for future-work steps, so progress stays 0/6 unless a real
 *    completion path exists.
 */
export function useLessonProgress(lesson: Lesson, initialStepIndex = 0): LessonProgressApi {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const totalSteps = lesson.steps.length;
  const completedCount = completedSteps.size;

  const statusFor = useCallback<LessonProgressApi["statusFor"]>(
    (stepIndex) => {
      const step = lesson.steps[stepIndex];
      if (!step) return "locked";
      if (completedSteps.has(step.id)) return "completed";
      if (stepIndex < currentStepIndex) return "available"; // passed-but-not-completed path (shouldn't usually happen in Part 1)
      if (stepIndex === currentStepIndex) return "current";
      // Future steps: locked in Part 1 if they require subsequent work,
      // otherwise locked unless they're the immediate next available step.
      if (stepIndex === currentStepIndex + 1 && !step.requiresFutureWork) return "available";
      return "locked";
    },
    [lesson.steps, completedSteps, currentStepIndex],
  );

  const goToStep = useCallback<LessonProgressApi["goToStep"]>(
    (index) => {
      const step = lesson.steps[index];
      if (!step) return;
      if (step.requiresFutureWork) return; // locked in Part 1
      // Only allow moving to current or immediately-next unlocked step.
      if (index <= currentStepIndex || index === currentStepIndex + 1) {
        setCurrentStepIndex(index);
      }
    },
    [lesson.steps, currentStepIndex],
  );

  const recordCompletion = useCallback<LessonProgressApi["recordCompletion"]>((stepId) => {
    setCompletedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const fraction = useMemo(() => {
    if (totalSteps === 0) return 0;
    return completedCount / totalSteps;
  }, [completedCount, totalSteps]);

  return useMemo(
    () => ({
      lesson,
      currentStepIndex,
      completedSteps,
      totalSteps,
      completedCount,
      fraction,
      statusFor,
      goToStep,
      recordCompletion,
    }),
    [lesson, currentStepIndex, completedSteps, totalSteps, completedCount, fraction, statusFor, goToStep, recordCompletion],
  );
}
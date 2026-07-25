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
  /** Navigate to any unlocked step. */
  goToStep: (index: number) => void;
  /** Mark a step complete (no fake completions — caller must call this). */
  recordCompletion: (stepId: string) => void;
  /** Mark the current step complete and advance to the next unlocked step. */
  completeAndAdvance: () => void;
}

/**
 * Owns lesson progress state for a single session.
 *
 * Completion policy:
 *  - Only an explicit `recordCompletion` / `completeAndAdvance` call marks
 *    a step done — never auto-completed.
 *  - Steps flagged `requiresFutureWork` stay locked (their UI is shipped in
 *    later parts), so they can't be entered or completed in this part.
 *  - Completing a step unlocks the very next non-future-work step; the next
 *    *future-work* step is unlocked only when the later part ships it.
 */
export function useLessonProgress(lesson: Lesson, initialStepIndex = 0): LessonProgressApi {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const totalSteps = lesson.steps.length;

  // First step from `i` onward that is NOT a future-work step (i.e. the next
  // step the student can actually visit). Returns lesson.steps.length if none.
  const nextUnlockedIndexFrom = useCallback(
    (from: number): number => {
      for (let i = from; i < lesson.steps.length; i++) {
        if (!lesson.steps[i].requiresFutureWork) return i;
      }
      return lesson.steps.length;
    },
    [lesson.steps],
  );

  const completedCount = completedSteps.size;

  const statusFor = useCallback<LessonProgressApi["statusFor"]>(
    (stepIndex) => {
      const step = lesson.steps[stepIndex];
      if (!step) return "locked";
      if (completedSteps.has(step.id)) return "completed";
      if (stepIndex === currentStepIndex) return "current";
      // Any earlier or adjacent step the navigation model allows visiting
      // without being explicitly completed is "available".
      if (stepIndex <= currentStepIndex) return "available";
      if (step.requiresFutureWork) return "locked"; // not yet shipped
      // Otherwise it's available only if every preceding step is completed.
      const predecessorsCompleted = lesson.steps
        .slice(0, stepIndex)
        .every((s) => completedSteps.has(s.id) || s.requiresFutureWork);
      return predecessorsCompleted ? "available" : "locked";
    },
    [lesson.steps, completedSteps, currentStepIndex],
  );

  const goToStep = useCallback<LessonProgressApi["goToStep"]>(
    (index) => {
      const step = lesson.steps[index];
      if (!step) return;
      if (step.requiresFutureWork) return; // locked
      // Allow going to the current step, any earlier step, or any step whose
      // prerequisites are done (i.e. status !== locked).
      if (index === currentStepIndex) {
        setCurrentStepIndex(index);
        return;
      }
      if (index < currentStepIndex) {
        setCurrentStepIndex(index);
        return;
      }
      const prerequisites = lesson.steps
        .slice(0, index)
        .every((s) => completedSteps.has(s.id) || s.requiresFutureWork);
      if (prerequisites) setCurrentStepIndex(index);
    },
    [lesson.steps, currentStepIndex, completedSteps],
  );

  const recordCompletion = useCallback<LessonProgressApi["recordCompletion"]>((stepId) => {
    setCompletedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const completeAndAdvance = useCallback<LessonProgressApi["completeAndAdvance"]>(() => {
    const step = lesson.steps[currentStepIndex];
    if (!step || step.requiresFutureWork) return;
    setCompletedSteps((prev) => {
      if (prev.has(step.id)) return prev;
      const next = new Set(prev);
      next.add(step.id);
      return next;
    });
    setCurrentStepIndex((curr) => {
      const next = nextUnlockedIndexFrom(curr + 1);
      return next < lesson.steps.length ? next : curr;
    });
  }, [lesson.steps, currentStepIndex, nextUnlockedIndexFrom]);

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
      completeAndAdvance,
    }),
    [
      lesson,
      currentStepIndex,
      completedSteps,
      totalSteps,
      completedCount,
      fraction,
      statusFor,
      goToStep,
      recordCompletion,
      completeAndAdvance,
    ],
  );
}
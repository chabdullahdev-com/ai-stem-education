// Core domain types for Gemma STEM.
// Kept separate from UI so data shapes can evolve without touching components.

import type { ExperimentConfig as _ExperimentConfig } from "./experiment/types";

export type AgeGroupId = "early-explorer" | "young-explorer" | "teen-learner" | "advanced-learner";

export interface AgeGroup {
  id: AgeGroupId;
  label: string;
  minAge: number;
  maxAge: number | null; // null = no upper bound
  description: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  /** Optional human-friendly identifier supplied by the student. */
  studentId?: string;
  createdAt: string; // ISO string
}

export type AppView = "welcome" | "dashboard" | "lesson";

export type LessonStepStatus = "locked" | "current" | "available" | "completed";

export type LessonStepKind =
  | "introduction"
  | "content"
  | "prepare-experiment"
  | "experiment"
  | "knowledge-check"
  | "assessment";

export interface LearningObjective {
  text: string;
}

/* -----------------------------------------------------------------------
 * Structured lesson content blocks.
 * All optional on a step — a step opt-in to whichever blocks it needs.
 * ----------------------------------------------------------------------- */

/** A concept explanation block, age-adaptable later via Gemma. */
export interface Concept {
  id: string;
  title: string;
  /** Short plain-language explanation shown in the UI. */
  summary: string;
  /** Optional deeper detail (shown under "Find out more"). */
  detail?: string;
  /** Optional example connecting the concept to everyday life. */
  everydayExample?: string;
}

/** An activity instruction block (non-hardware standalone tasks). */
export interface Activity {
  id: string;
  title: string;
  /** Intro / context for the activity. */
  brief: string;
  /** Ordered steps the student follows. */
  instructions: string[];
  /** Optional safety / help note. */
  note?: string;
}

/** Shared shape for any question presented to the student. */
export type QuestionType = "multiple-choice" | "true-false" | "open-ended";

export interface BaseQuestion {
  id: string;
  /** The prompt text the student sees. */
  prompt: string;
  /** Optional supporting context shown above the prompt. */
  context?: string;
  /** Minimum student age for this question to be shown. If omitted, shows for all ages. */
  minAge?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple-choice";
  /** Answer options. */
  options: string[];
  /** 0-based index of the correct option. */
  correctIndex: number;
  /** Short explanation shown after revealing the answer. */
  explanation: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true-false";
  /** The correct boolean answer. */
  correct: boolean;
  explanation: string;
}

export interface OpenEndedQuestion extends BaseQuestion {
  type: "open-ended";
  /** What a correct answer should cover — used by Gemma for evaluation. */
  expectedConcepts: string[];
  /** A model answer for reference (not shown until after submission). */
  modelAnswer?: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | OpenEndedQuestion;

// Experiment configuration is defined in lib/experiment/types.ts to avoid
// a circular import (ExperimentConfig references sensor-related types).
export type { ExperimentConfig } from "./experiment/types";

export interface LessonStep {
  id: string;
  title: string;
  kind: LessonStepKind;
  /** Whether this step requires future hardware/AI integration (kept locked in earlier parts). */
  requiresFutureWork?: boolean;
  objectives?: LearningObjective[];
  /** Short description shown at the top of the step. */
  summary?: string;
  /** Concept explanation blocks (content steps). */
  concepts?: Concept[];
  /** Standalone activity instructions (content / prepare-experiment steps). */
  activity?: Activity;
  /** Quiz questions (knowledge-check steps). */
  questions?: Question[];
  /** Assessment questions (assessment steps). */
  assessment?: Question[];
  /** Experiment configuration (experiment steps). Drives validation thresholds. */
  experimentConfig?: _ExperimentConfig;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  objectives: LearningObjective[];
  /** Lesson-level concept overview (mirrored across content steps). */
  concepts?: Concept[];
  /** Hardware components needed for this lesson (informational only in Part 3). */
  requiredHardware?: string[];
  steps: LessonStep[];
  /** Structured knowledge Gemma receives as teaching context. */
  knowledgeBlock?: string;
}
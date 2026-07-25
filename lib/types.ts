// Core domain types for Gemma STEM.
// Kept separate from UI so data shapes can evolve without touching components.

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
  | "experiment"
  | "knowledge-check"
  | "assessment";

export interface LearningObjective {
  text: string;
}

export interface LessonStep {
  id: string;
  title: string;
  kind: LessonStepKind;
  /** Whether this step requires future hardware/AI integration (kept locked in Part 1). */
  requiresFutureWork?: boolean;
  objectives?: LearningObjective[];
  /** Body content; kept generic so future parts can render rich blocks. */
  summary?: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  objectives: LearningObjective[];
  steps: LessonStep[];
}
/** Scoring & completion types. */

export interface ScoreBreakdown {
  /** 0–100: physical experiment execution + validation success. */
  practicalSkills: number;
  /** 0–100: open-ended evaluation + remediation tracking. */
  conceptUnderstanding: number;
  /** 0–100: objective quiz performance (MCQ + true/false). */
  knowledgeAssessment: number;
  /** 0–100: weighted aggregate. */
  composite: number;
}

export interface AssessmentLog {
  questionId: string;
  questionType: "multiple-choice" | "true-false" | "open-ended";
  correct: boolean | null; // null = open-ended (graded by Gemma)
  attempts: number;
  hintsRequested: number;
  understandingLevel: "High" | "Medium" | "Low" | null;
  studentAnswer?: string;
}

export interface ExperimentTelemetry {
  baselineTemperature: number | null;
  coldDeltaT: number | null;
  warmDeltaT: number | null;
  coldPassed: boolean;
  warmPassed: boolean;
  isRealHardware: boolean;
  durationSec: number | null;
}

export interface LessonCompletionRecord {
  lessonId: string;
  lessonTitle: string;
  studentName: string;
  studentAge: number;
  completedAt: string; // ISO string
  scores: ScoreBreakdown;
  experimentTelemetry: ExperimentTelemetry;
  assessmentLogs: AssessmentLog[];
  certificateReady: boolean;
}

/** Weight configuration — transparent, application-side, not Gemma-invented. */
export const SCORE_WEIGHTS = {
  practicalSkills: 0.35,
  conceptUnderstanding: 0.30,
  knowledgeAssessment: 0.35,
} as const;
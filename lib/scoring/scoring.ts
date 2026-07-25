import type { AssessmentLog, ExperimentTelemetry, ScoreBreakdown } from "./types";
import { SCORE_WEIGHTS } from "./types";

/**
 * Deterministic scoring engine.
 *
 * All scores are computed application-side from recorded data.
 * Gemma never assigns numerical scores — it only provides explanatory text.
 */

export function computePracticalSkillsScore(telemetry: ExperimentTelemetry): number {
  let score = 0;
  // Baseline captured
  if (telemetry.baselineTemperature !== null) score += 25;
  // Cold water test passed
  if (telemetry.coldPassed) score += 35;
  // Warm water test passed
  if (telemetry.warmPassed) score += 30;
  // Used real hardware (not simulation)
  if (telemetry.isRealHardware) score += 10;
  return Math.min(100, score);
}

export function computeConceptUnderstandingScore(logs: AssessmentLog[]): number {
  const openEnded = logs.filter((l) => l.questionType === "open-ended");
  if (openEnded.length === 0) return 0;

  let totalPoints = 0;
  let maxPoints = 0;

  for (const log of openEnded) {
    maxPoints += 100;
    if (log.understandingLevel === "High") totalPoints += 100;
    else if (log.understandingLevel === "Medium") totalPoints += 60;
    else if (log.understandingLevel === "Low") totalPoints += 25;
    else totalPoints += 30; // un-graded but attempted

    // Penalise excessive attempts and hint reliance
    if (log.attempts > 1) totalPoints -= 10 * (log.attempts - 1);
    if (log.hintsRequested > 0) totalPoints -= 5 * log.hintsRequested;
  }

  return Math.max(0, Math.min(100, Math.round((totalPoints / maxPoints) * 100)));
}

export function computeKnowledgeAssessmentScore(logs: AssessmentLog[]): number {
  const objective = logs.filter((l) => l.questionType === "multiple-choice" || l.questionType === "true-false");
  if (objective.length === 0) return 0;

  const correct = objective.filter((l) => l.correct === true).length;
  return Math.round((correct / objective.length) * 100);
}

export function computeCompositeScore(scores: { practicalSkills: number; conceptUnderstanding: number; knowledgeAssessment: number }): number {
  return Math.round(
    scores.practicalSkills * SCORE_WEIGHTS.practicalSkills +
    scores.conceptUnderstanding * SCORE_WEIGHTS.conceptUnderstanding +
    scores.knowledgeAssessment * SCORE_WEIGHTS.knowledgeAssessment,
  );
}

export function computeAllScores(opts: {
  telemetry: ExperimentTelemetry;
  assessmentLogs: AssessmentLog[];
}): ScoreBreakdown {
  const practicalSkills = computePracticalSkillsScore(opts.telemetry);
  const conceptUnderstanding = computeConceptUnderstandingScore(opts.assessmentLogs);
  const knowledgeAssessment = computeKnowledgeAssessmentScore(opts.assessmentLogs);
  const composite = computeCompositeScore({ practicalSkills, conceptUnderstanding, knowledgeAssessment });
  return { practicalSkills, conceptUnderstanding, knowledgeAssessment, composite };
}

/**
 * Determine if the lesson is complete: all required activities and
 * assessments must pass.
 */
export function isLessonComplete(opts: {
  experimentPassed: boolean;
  assessmentLogs: AssessmentLog[];
  minAssessmentScore: number;
}): boolean {
  if (!opts.experimentPassed) return false;
  const knowledgeScore = computeKnowledgeAssessmentScore(opts.assessmentLogs);
  return knowledgeScore >= opts.minAssessmentScore;
}

/* -----------------------------------------------------------------------
 * Persistence
 * ----------------------------------------------------------------------- */

const STORAGE_KEY = "gemma-stem:lesson-completion";

export function saveLessonCompletion(record: {
  lessonId: string;
  lessonTitle: string;
  studentName: string;
  studentAge: number;
  scores: ScoreBreakdown;
  experimentTelemetry: ExperimentTelemetry;
  assessmentLogs: AssessmentLog[];
}): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadAllCompletions();
    const entry = {
      ...record,
      completedAt: new Date().toISOString(),
      certificateReady: true,
    };
    const updated = [...existing.filter((e) => e.lessonId !== record.lessonId), entry];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore storage errors */
  }
}

interface StoredCompletion {
  lessonId: string;
  lessonTitle: string;
  studentName: string;
  studentAge: number;
  completedAt: string;
  scores: ScoreBreakdown;
  experimentTelemetry: ExperimentTelemetry;
  assessmentLogs: AssessmentLog[];
  certificateReady: boolean;
}

export function loadAllCompletions(): StoredCompletion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredCompletion[];
  } catch {
    return [];
  }
}

export function loadCompletionForLesson(lessonId: string): StoredCompletion | null {
  const all = loadAllCompletions();
  return all.find((e) => e.lessonId === lessonId) ?? null;
}
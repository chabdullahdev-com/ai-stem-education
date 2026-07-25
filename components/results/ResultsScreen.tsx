"use client";

import { useEffect, useState } from "react";
import type { ScoreBreakdown, ExperimentTelemetry } from "@/lib/scoring/types";

interface ResultsScreenProps {
  scores: ScoreBreakdown;
  telemetry: ExperimentTelemetry;
  studentName: string;
  studentAge: number;
  onExit: () => void;
}

function ScoreRing({ label, score, maxScore = 100 }: { label: string; score: number; maxScore?: number }) {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / maxScore) * circumference;
  const color = score >= 75 ? "var(--primary)" : score >= 50 ? "var(--secondary)" : "var(--lock)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="rotate-90" style={{ transformOrigin: "50% 50%", fontSize: "22px", fontWeight: "700", fill: "var(--foreground)" }}>
          {score}
        </text>
      </svg>
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
    </div>
  );
}

export function ResultsScreen({ scores, telemetry, studentName, studentAge, onExit }: ResultsScreenProps) {
  const [gemmaFeedback, setGemmaFeedback] = useState<string | null>(null);
  const [gemmaLoading, setGemmaLoading] = useState(true);
  const [gemmaError, setGemmaError] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      setGemmaLoading(true);
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: {
              studentName,
              studentAge,
              ageGroupId: studentAge <= 7 ? "early-explorer" : studentAge <= 12 ? "young-explorer" : studentAge <= 17 ? "teen-learner" : "advanced-learner",
              ageGroupLabel: "",
              lessonTitle: "Temperature Sensors",
              lessonSlug: "temperature-sensors",
              stepTitle: "Final Assessment",
              stepKind: "assessment",
              stepIndex: 6,
              lessonKnowledge: "",
            },
            messages: [{
              id: "results-feedback",
              role: "user",
              text: `The student has completed the Temperature Sensors lesson. Here are their scores:\n- Practical Skills: ${scores.practicalSkills}/100\n- Concept Understanding: ${scores.conceptUnderstanding}/100\n- Knowledge Assessment: ${scores.knowledgeAssessment}/100\n- Overall Composite: ${scores.composite}/100\n\nExperiment: ${telemetry.coldPassed ? "Cold water test passed" : "Cold water test not passed"}, ${telemetry.warmPassed ? "Warm water test passed" : "Warm water test not passed"}. Baseline: ${telemetry.baselineTemperature}°C, Cold ΔT: ${telemetry.coldDeltaT}°C, Warm ΔT: ${telemetry.warmDeltaT}°C.\n\nGive the student specific, personalized feedback based on these numbers. Address their strongest and weakest areas.`,
              status: "success",
              createdAt: Date.now(),
            }],
          }),
        });

        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as { text: string };
        setGemmaFeedback(data.text);
      } catch {
        setGemmaError(true);
      } finally {
        setGemmaLoading(false);
      }
    };

    void fetchFeedback();
  }, [scores, telemetry, studentName, studentAge]);

  const passed = scores.composite >= 60;

  return (
    <div className="animate-stem-fade-up space-y-8">
      {/* Hero */}
      <div className="text-center">
        {passed ? (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]">
            <svg className="h-8 w-8 text-[var(--surface)]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--foreground)]">
          Temperature Sensor Lesson {passed ? "Complete" : "Results"}
        </h1>
        <p className="mt-2 text-lg text-[var(--muted)]">
          {passed ? `Great work, ${studentName}! Here's how you did.` : `Keep going, ${studentName}. Here's where you stand.`}
        </p>
      </div>

      {/* Score rings */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <ScoreRing label="Practical Skills" score={scores.practicalSkills} />
        <ScoreRing label="Concept Understanding" score={scores.conceptUnderstanding} />
        <ScoreRing label="Knowledge" score={scores.knowledgeAssessment} />
        <ScoreRing label="Overall" score={scores.composite} />
      </div>

      {/* Experiment summary */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">Experiment Summary</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Baseline</dt>
            <dd className="font-semibold text-[var(--foreground)]">{telemetry.baselineTemperature ?? "—"} °C</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Cold ΔT</dt>
            <dd className={`font-semibold ${telemetry.coldPassed ? "text-[var(--primary-ink)]" : "text-[var(--secondary)]"}`}>
              {telemetry.coldDeltaT ?? "—"} °C {telemetry.coldPassed ? "✓" : "✕"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Warm ΔT</dt>
            <dd className={`font-semibold ${telemetry.warmPassed ? "text-[var(--primary-ink)]" : "text-[var(--secondary)]"}`}>
              {telemetry.warmDeltaT ?? "—"} °C {telemetry.warmPassed ? "✓" : "✕"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">Source</dt>
            <dd className="font-semibold text-[var(--foreground)]">{telemetry.isRealHardware ? "Real Hardware" : "Simulation"}</dd>
          </div>
        </dl>
      </div>

      {/* Gemma feedback */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] font-[family-name:var(--font-display)] text-sm font-bold text-[var(--surface)]">G</div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">Gemma&apos;s Feedback</p>
            <p className="text-xs text-[var(--muted)]">Personalized based on your results</p>
          </div>
        </div>

        {gemmaLoading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-stem-pulse rounded-full bg-[var(--primary)]" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </span>
            Gemma is preparing your feedback…
          </div>
        ) : null}

        {gemmaFeedback ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">{gemmaFeedback}</p>
        ) : null}

        {gemmaError ? (
          <p className="mt-3 text-sm text-[var(--secondary)]">Gemma is currently unavailable. Your scores are saved.</p>
        ) : null}
      </div>

      {/* Exit button */}
      <button
        type="button"
        onClick={onExit}
        className="w-full rounded-xl bg-[var(--primary)] px-6 py-3.5 text-base font-semibold text-[var(--surface)] shadow-lg shadow-[color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:bg-[var(--primary-ink)]"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
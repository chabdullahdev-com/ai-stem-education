"use client";

import type { ExperimentConfig, ExperimentPhase, PhaseCapture, ValidationCheck } from "@/lib/experiment/types";
import { ConnectionStatusBadge } from "@/components/hardware/ConnectionStatusBadge";
import { TemperatureGraph } from "@/components/hardware/TemperatureGraph";
import type { HistoryPoint } from "@/components/hardware/TemperatureGraph";
import type { ConnectionStatus } from "@/lib/hardware/types";

interface ExperimentRunnerProps {
  config: ExperimentConfig;
  phase: ExperimentPhase;
  baselineTemp: number | null;
  coldCapture: PhaseCapture | null;
  warmCapture: PhaseCapture | null;
  validationChecks: ValidationCheck[];
  currentTemperature: number | null;
  hwStatus: ConnectionStatus;
  history: HistoryPoint[];
  isRealHardware: boolean;
  gemmaAnalysis: string | null;
  gemmaLoading: boolean;
  gemmaError: boolean;
  onStartBaseline: () => void;
  onStartColdWater: () => void;
  onStartWarmWater: () => void;
  onReset: () => void;
  onRetry: () => void;
  onRequestGemma: () => void;
  onRequestTroubleshooting: () => void;
}

const PHASE_LABELS: Record<ExperimentPhase, string> = {
  idle: "Ready to begin",
  baseline: "Capturing baseline…",
  baseline_stable: "Baseline confirmed",
  cold_water: "Cold water test in progress…",
  cold_water_done: "Cold water test complete",
  warm_water: "Warm water test in progress…",
  warm_water_done: "Warm water test complete",
  complete: "Experiment complete",
  needs_retry: "Needs retry",
  error: "Experiment error",
};

function PhaseStep({
  number,
  title,
  description,
  state,
  children,
}: {
  number: number;
  title: string;
  description: string;
  state: "pending" | "active" | "done" | "failed";
  children?: React.ReactNode;
}) {
  const colors = {
    pending: "border-[var(--border)] bg-[var(--surface-2)] opacity-60",
    active: "border-[var(--primary)] bg-[var(--surface)] shadow-md",
    done: "border-[var(--primary)] bg-[var(--primary-soft)]",
    failed: "border-[var(--secondary)] bg-[var(--secondary-soft)]",
  };
  const glyphColors = {
    pending: "bg-[var(--lock)] text-[var(--surface)]",
    active: "bg-[var(--primary)] text-[var(--surface)] animate-stem-pulse",
    done: "bg-[var(--primary)] text-[var(--surface)]",
    failed: "bg-[var(--secondary)] text-[var(--surface)]",
  };

  return (
    <div className={`rounded-2xl border-2 p-5 transition ${colors[state]}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${glyphColors[state]}`}>
          {state === "done" ? "✓" : state === "failed" ? "!" : number}
        </span>
        <div className="flex-1">
          <h4 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--foreground)]">{title}</h4>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function ValidationChecklist({ checks }: { checks: ValidationCheck[] }) {
  const stateColors = {
    waiting: "text-[var(--muted)]",
    in_progress: "text-[var(--secondary)]",
    successful: "text-[var(--primary)]",
    needs_retry: "text-[var(--secondary)]",
    invalid_data: "text-[var(--secondary)]",
    hardware_disconnected: "text-[var(--secondary)]",
  };
  const stateGlyphs = {
    waiting: "○",
    in_progress: "◐",
    successful: "✓",
    needs_retry: "↻",
    invalid_data: "✕",
    hardware_disconnected: "⚠",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Validation</p>
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.id} className="flex items-center gap-2 text-sm">
            <span className={`text-base ${stateColors[c.state]}`}>{stateGlyphs[c.state]}</span>
            <span className="font-medium text-[var(--foreground)]">{c.label}</span>
            {c.detail ? <span className="text-xs text-[var(--muted)]">— {c.detail}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExperimentRunner(props: ExperimentRunnerProps) {
  const {
    config,
    phase,
    baselineTemp,
    coldCapture,
    warmCapture,
    validationChecks,
    currentTemperature,
    hwStatus,
    history,
    isRealHardware,
    gemmaAnalysis,
    gemmaLoading,
    gemmaError,
    onStartBaseline,
    onStartColdWater,
    onStartWarmWater,
    onReset,
    onRetry,
    onRequestGemma,
    onRequestTroubleshooting,
  } = props;

  const isConnected = hwStatus === "connected";
  const phaseLabel = PHASE_LABELS[phase];

  // Determine step states
  const baselineState = baselineTemp !== null ? "done" : phase === "baseline" ? "active" : phase === "idle" ? "pending" : "done";
  const coldState = coldCapture?.passed ? "done" : coldCapture && !coldCapture.passed ? "failed" : phase === "cold_water" ? "active" : phase === "baseline_stable" || phase === "cold_water_done" ? "pending" : "pending";
  const warmState = warmCapture?.passed ? "done" : warmCapture && !warmCapture.passed ? "failed" : phase === "warm_water" ? "active" : "pending";

  const isComplete = phase === "complete";
  const needsRetry = phase === "needs_retry" || phase === "error";

  return (
    <div className="space-y-6">
      {/* Status + live temp */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ConnectionStatusBadge status={hwStatus} />
          <span className="text-sm font-semibold text-[var(--foreground)]">{phaseLabel}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Live</p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--foreground)]">
            {currentTemperature != null ? `${currentTemperature.toFixed(1)} °C` : "--.- °C"}
          </p>
        </div>
      </div>

      {/* Sim badge */}
      {!isRealHardware ? (
        <span className="inline-block rounded-full bg-[var(--secondary-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]">
          Simulation Mode
        </span>
      ) : null}

      {/* Graph */}
      {history.length >= 2 ? <TemperatureGraph history={history} height={120} /> : null}

      {/* Phase steps */}
      <div className="space-y-3">
        <PhaseStep
          number={1}
          title="Baseline Reading"
          description={`Place the sensor in room air. Wait for ${config.baselineStabilityWindow} stable readings (variation ≤ ${config.baselineStabilityThreshold}°C).`}
          state={baselineState as "pending" | "active" | "done" | "failed"}
        >
          {phase === "idle" && isConnected ? (
            <button
              type="button"
              onClick={onStartBaseline}
              className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)]"
            >
              Start Baseline
            </button>
          ) : null}
          {baselineTemp !== null ? (
            <p className="mt-2 text-sm font-semibold text-[var(--primary-ink)]">Baseline: {baselineTemp.toFixed(1)} °C</p>
          ) : null}
        </PhaseStep>

        <PhaseStep
          number={2}
          title="Cold Water Test"
          description={`Place the sensor in cold water. The temperature must drop by at least ${config.coldWaterDeltaThreshold}°C within ${config.coldWaterTimeoutSec}s.`}
          state={coldState as "pending" | "active" | "done" | "failed"}
        >
          {phase === "baseline_stable" && isConnected ? (
            <button
              type="button"
              onClick={onStartColdWater}
              className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)]"
            >
              Start Cold Water Test
            </button>
          ) : null}
          {coldCapture ? (
            <p className={`mt-2 text-sm font-semibold ${coldCapture.passed ? "text-[var(--primary-ink)]" : "text-[var(--secondary)]"}`}>
              Min: {coldCapture.minTemperature?.toFixed(1)} °C · ΔT: {coldCapture.deltaT?.toFixed(1)} °C · {coldCapture.passed ? "Passed" : "Did not drop enough"}
            </p>
          ) : null}
        </PhaseStep>

        <PhaseStep
          number={3}
          title="Warm Water Test"
          description={`Place the sensor in warm water. The temperature must rise by at least ${config.warmWaterDeltaThreshold}°C within ${config.warmWaterTimeoutSec}s.`}
          state={warmState as "pending" | "active" | "done" | "failed"}
        >
          {phase === "cold_water_done" && coldCapture?.passed && isConnected ? (
            <button
              type="button"
              onClick={onStartWarmWater}
              className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)]"
            >
              Start Warm Water Test
            </button>
          ) : null}
          {warmCapture ? (
            <p className={`mt-2 text-sm font-semibold ${warmCapture.passed ? "text-[var(--primary-ink)]" : "text-[var(--secondary)]"}`}>
              Max: {warmCapture.maxTemperature?.toFixed(1)} °C · ΔT: {warmCapture.deltaT?.toFixed(1)} °C · {warmCapture.passed ? "Passed" : "Did not rise enough"}
            </p>
          ) : null}
        </PhaseStep>
      </div>

      {/* Validation checklist */}
      <ValidationChecklist checks={validationChecks} />

      {/* Gemma analysis section */}
      {isComplete || needsRetry ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] font-[family-name:var(--font-display)] text-sm font-bold text-[var(--surface)]">G</div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">Gemma&apos;s Analysis</p>
              <p className="text-xs text-[var(--muted)]">AI-powered explanation of your results</p>
            </div>
          </div>

          {!gemmaAnalysis && !gemmaLoading && !gemmaError ? (
            <button
              type="button"
              onClick={onRequestGemma}
              className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)]"
            >
              Ask Gemma to explain my results
            </button>
          ) : null}

          {gemmaLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-stem-pulse rounded-full bg-[var(--primary)]" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </span>
              Gemma is analyzing your experiment…
            </div>
          ) : null}

          {gemmaAnalysis ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">{gemmaAnalysis}</p>
          ) : null}

          {gemmaError ? (
            <div className="mt-3">
              <p className="text-sm text-[var(--secondary)]">Gemma is currently unavailable. Please try again.</p>
              <button
                type="button"
                onClick={onRequestGemma}
                className="mt-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Troubleshooting (on failure) */}
      {needsRetry ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)]"
          >
            Retry Experiment
          </button>
          <button
            type="button"
            onClick={onRequestTroubleshooting}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
          >
            Ask Gemma for troubleshooting help
          </button>
        </div>
      ) : null}

      {/* Reset */}
      {phase !== "idle" ? (
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)]"
        >
          Reset experiment
        </button>
      ) : null}
    </div>
  );
}
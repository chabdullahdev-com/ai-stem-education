/**
 * Experiment & validation engine types.
 *
 * All physical thresholds are configured via the lesson data schema
 * (ExperimentConfig on the experiment step), never hardcoded in logic.
 */

/* -----------------------------------------------------------------------
 * Experiment phases
 * ----------------------------------------------------------------------- */

export type ExperimentPhase =
  | "idle"               // before the experiment starts
  | "baseline"           // capturing ambient baseline
  | "baseline_stable"    // baseline confirmed stable
  | "cold_water"         // cold water test in progress
  | "cold_water_done"    // cold water test completed
  | "warm_water"         // warm water test in progress
  | "warm_water_done"    // warm water test completed
  | "complete"           // all phases passed
  | "needs_retry"        // a phase failed, student can retry
  | "error";             // unrecoverable hardware/data error

/* -----------------------------------------------------------------------
 * Validation states
 * ----------------------------------------------------------------------- */

export type ValidationState =
  | "waiting"
  | "in_progress"
  | "successful"
  | "needs_retry"
  | "invalid_data"
  | "hardware_disconnected";

export interface ValidationCheck {
  id: string;
  label: string;
  state: ValidationState;
  detail?: string;
}

/* -----------------------------------------------------------------------
 * Experiment configuration (lives on the lesson step, not hardcoded)
 * ----------------------------------------------------------------------- */

export interface ExperimentConfig {
  /** Number of consecutive readings required to confirm baseline stabilization. */
  baselineStabilityWindow: number;
  /** Max allowed variation (°C) between consecutive readings to count as "stable". */
  baselineStabilityThreshold: number;
  /** Minimum temperature drop (°C) to pass the cold water test. */
  coldWaterDeltaThreshold: number;
  /** Minimum temperature rise (°C) to pass the warm water test. */
  warmWaterDeltaThreshold: number;
  /** Max seconds for the cold water phase before timing out. */
  coldWaterTimeoutSec: number;
  /** Max seconds for the warm water phase before timing out. */
  warmWaterTimeoutSec: number;
  /** Minimum number of readings to capture during each water test. */
  minReadingsPerPhase: number;
}

/* -----------------------------------------------------------------------
 * Experiment metrics (sent to Gemma post-experiment)
 * ----------------------------------------------------------------------- */

export interface ExperimentMetrics {
  studentName: string;
  studentAge: number;
  baselineTemperature: number | null;
  coldMinTemperature: number | null;
  coldDeltaT: number | null;
  coldDurationSec: number | null;
  warmMaxTemperature: number | null;
  warmDeltaT: number | null;
  warmDurationSec: number | null;
  netChange: number | null;
  status: "successful" | "needs_retry" | "invalid_data" | "hardware_disconnected";
  isRealHardware: boolean;
  timestamp: number;
}

/* -----------------------------------------------------------------------
 * Phase capture data
 * ----------------------------------------------------------------------- */

export interface PhaseCapture {
  startedAt: number;
  endedAt: number | null;
  readings: { timestamp: number; temperature: number }[];
  minTemperature: number | null;
  maxTemperature: number | null;
  deltaT: number | null;
  durationSec: number | null;
  passed: boolean;
}
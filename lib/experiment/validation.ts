import type { ConnectionStatus } from "@/lib/hardware/types";
import type { ExperimentConfig, ExperimentMetrics, PhaseCapture, ValidationCheck, ValidationState } from "./types";

/**
 * Deterministic validation engine.
 *
 * All checks are application-side — numeric facts are computed here, never
 * delegated to Gemma. Gemma's role is to explain what the facts mean, not to
 * decide pass/fail.
 */

export function checkHardwareConnection(status: ConnectionStatus): ValidationCheck {
  if (status === "connected") {
    return { id: "hw_connection", label: "Hardware connected", state: "successful" };
  }
  if (status === "disconnected" || status === "error") {
    return { id: "hw_connection", label: "Hardware connected", state: "hardware_disconnected", detail: "Sensor is not connected." };
  }
  return { id: "hw_connection", label: "Hardware connected", state: "in_progress", detail: "Establishing connection…" };
}

export function checkValidReadings(readings: number[]): ValidationCheck {
  if (readings.length === 0) {
    return { id: "valid_readings", label: "Valid sensor readings", state: "waiting" };
  }
  const allValid = readings.every((r) => Number.isFinite(r) && r > -100);
  return {
    id: "valid_readings",
    label: "Valid sensor readings",
    state: allValid ? "successful" : "invalid_data",
    detail: allValid ? `${readings.length} readings captured` : "Some readings are invalid (NaN or out of range).",
  };
}

export function checkBaseline(
  baselineTemp: number | null,
  baselineReadings: number[],
  config: ExperimentConfig,
): ValidationCheck {
  if (baselineTemp === null) {
    return { id: "baseline", label: "Baseline captured", state: "waiting" };
  }
  if (baselineReadings.length < config.baselineStabilityWindow) {
    return { id: "baseline", label: "Baseline captured", state: "in_progress", detail: `Collecting (${baselineReadings.length}/${config.baselineStabilityWindow})` };
  }
  return { id: "baseline", label: "Baseline captured", state: "successful", detail: `${baselineTemp.toFixed(1)} °C` };
}

export function checkColdWater(capture: PhaseCapture | null, config: ExperimentConfig): ValidationCheck {
  if (!capture) {
    return { id: "cold_water", label: "Cold water test", state: "waiting" };
  }
  if (!capture.passed) {
    return {
      id: "cold_water",
      label: "Cold water test",
      state: "needs_retry",
      detail: `ΔT = ${capture.deltaT?.toFixed(1) ?? "?"} °C (need ${config.coldWaterDeltaThreshold}°C drop)`,
    };
  }
  return {
    id: "cold_water",
    label: "Cold water test",
    state: "successful",
    detail: `Dropped ${capture.deltaT?.toFixed(1) ?? "?"} °C`,
  };
}

export function checkWarmWater(capture: PhaseCapture | null, config: ExperimentConfig): ValidationCheck {
  if (!capture) {
    return { id: "warm_water", label: "Warm water test", state: "waiting" };
  }
  if (!capture.passed) {
    return {
      id: "warm_water",
      label: "Warm water test",
      state: "needs_retry",
      detail: `ΔT = ${capture.deltaT?.toFixed(1) ?? "?"} °C (need ${config.warmWaterDeltaThreshold}°C rise)`,
    };
  }
  return {
    id: "warm_water",
    label: "Warm water test",
    state: "successful",
    detail: `Rose ${capture.deltaT?.toFixed(1) ?? "?"} °C`,
  };
}

/**
 * Compute all validation checks at once.
 */
export function runAllChecks(opts: {
  hwStatus: ConnectionStatus;
  allTemperatures: number[];
  baselineTemp: number | null;
  baselineReadings: number[];
  coldCapture: PhaseCapture | null;
  warmCapture: PhaseCapture | null;
  config: ExperimentConfig;
}): ValidationCheck[] {
  return [
    checkHardwareConnection(opts.hwStatus),
    checkValidReadings(opts.allTemperatures),
    checkBaseline(opts.baselineTemp, opts.baselineReadings, opts.config),
    checkColdWater(opts.coldCapture, opts.config),
    checkWarmWater(opts.warmCapture, opts.config),
  ];
}

/**
 * Build the structured metrics object sent to Gemma post-experiment.
 */
export function buildExperimentMetrics(opts: {
  studentName: string;
  studentAge: number;
  baselineTemp: number | null;
  coldCapture: PhaseCapture | null;
  warmCapture: PhaseCapture | null;
  isRealHardware: boolean;
  status: ValidationState;
}): ExperimentMetrics {
  const baseline = opts.baselineTemp;
  const coldMin = opts.coldCapture?.minTemperature ?? null;
  const coldDelta = opts.coldCapture?.deltaT ?? null;
  const coldDur = opts.coldCapture?.durationSec ?? null;
  const warmMax = opts.warmCapture?.maxTemperature ?? null;
  const warmDelta = opts.warmCapture?.deltaT ?? null;
  const warmDur = opts.warmCapture?.durationSec ?? null;

  let netChange: number | null = null;
  if (baseline !== null && coldMin !== null && warmMax !== null) {
    netChange = warmMax - coldMin;
  }

  return {
    studentName: opts.studentName,
    studentAge: opts.studentAge,
    baselineTemperature: baseline,
    coldMinTemperature: coldMin,
    coldDeltaT: coldDelta,
    coldDurationSec: coldDur,
    warmMaxTemperature: warmMax,
    warmDeltaT: warmDelta,
    warmDurationSec: warmDur,
    netChange,
    status: opts.status === "successful" ? "successful" : opts.status === "hardware_disconnected" ? "hardware_disconnected" : "needs_retry",
    isRealHardware: opts.isRealHardware,
    timestamp: Date.now(),
  };
}

/**
 * Serialize metrics to a JSON string for Gemma context injection.
 */
export function metricsToJson(metrics: ExperimentMetrics): string {
  return JSON.stringify(metrics, null, 2);
}
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConnectionStatus } from "@/lib/hardware/types";
import type { ExperimentConfig, ExperimentPhase, PhaseCapture, ValidationCheck } from "./types";
import { runAllChecks, buildExperimentMetrics } from "./validation";

/**
 * Experiment state machine hook.
 *
 * Drives the 3-phase physical experiment:
 *   Baseline → Cold Water → Warm Water → Complete
 *
 * Consumes live sensor readings from a hardware hook (the same hook that
 * powers the HardwarePanel) and applies deterministic validation. The
 * application computes all numeric facts; Gemma only explains them.
 */

interface UseExperimentOpts {
  config: ExperimentConfig;
  /** Live temperature from the hardware hook (null = no reading yet). */
  currentTemperature: number | null;
  /** Connection status from the hardware hook. */
  hwStatus: ConnectionStatus;
  /** Whether the current reading comes from real hardware. */
  isRealHardware: boolean;
  /** Student profile for metrics. */
  studentName: string;
  studentAge: number;
  /** All temperature readings captured so far (from the hardware hook history). */
  allReadings: number[];
}

export function useExperiment(opts: UseExperimentOpts) {
  const { config, currentTemperature, hwStatus, isRealHardware, studentName, studentAge, allReadings } = opts;

  const [phase, setPhase] = useState<ExperimentPhase>("idle");
  const [baselineTemp, setBaselineTemp] = useState<number | null>(null);
  const [baselineReadings, setBaselineReadings] = useState<number[]>([]);
  const [coldCapture, setColdCapture] = useState<PhaseCapture | null>(null);
  const [warmCapture, setWarmCapture] = useState<PhaseCapture | null>(null);
  const [gemmaAnalysis, setGemmaAnalysis] = useState<string | null>(null);
  const [gemmaLoading, setGemmaLoading] = useState(false);
  const [gemmaError, setGemmaError] = useState(false);

  // Phase capture accumulators (refs to avoid stale closures)
  const phaseStartRef = useRef<number>(0);
  const phaseReadingsRef = useRef<{ timestamp: number; temperature: number }[]>([]);

  /* -----------------------------------------------------------------------
   * Phase transitions
   * ----------------------------------------------------------------------- */

  const startBaseline = useCallback(() => {
    setPhase("baseline");
    setBaselineTemp(null);
    setBaselineReadings([]);
    setColdCapture(null);
    setWarmCapture(null);
    setGemmaAnalysis(null);
    phaseReadingsRef.current = [];
  }, []);

  const startColdWater = useCallback(() => {
    setPhase("cold_water");
    phaseStartRef.current = Date.now();
    phaseReadingsRef.current = [];
  }, []);

  const startWarmWater = useCallback(() => {
    setPhase("warm_water");
    phaseStartRef.current = Date.now();
    phaseReadingsRef.current = [];
  }, []);

  const resetExperiment = useCallback(() => {
    setPhase("idle");
    setBaselineTemp(null);
    setBaselineReadings([]);
    setColdCapture(null);
    setWarmCapture(null);
    setGemmaAnalysis(null);
    phaseReadingsRef.current = [];
  }, []);

  /* -----------------------------------------------------------------------
   * Live reading processing — runs on every new temperature
   * ----------------------------------------------------------------------- */
  const lastProcessedTempRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentTemperature === null || currentTemperature === lastProcessedTempRef.current) return;
    lastProcessedTempRef.current = currentTemperature;

    // BASELINE: collect readings until stable
    if (phase === "baseline") {
      const newReadings = [...baselineReadings, currentTemperature];
      setBaselineReadings(newReadings);

      if (newReadings.length >= config.baselineStabilityWindow) {
        const window = newReadings.slice(-config.baselineStabilityWindow);
        const variation = Math.max(...window) - Math.min(...window);
        if (variation <= config.baselineStabilityThreshold) {
          const avg = window.reduce((a, b) => a + b, 0) / window.length;
          setBaselineTemp(Math.round(avg * 100) / 100);
          setPhase("baseline_stable");
        }
      }
      return;
    }

    // COLD WATER: capture readings until a threshold drop is detected
    if (phase === "cold_water") {
      phaseReadingsRef.current.push({ timestamp: Date.now(), temperature: currentTemperature });

      const readings = phaseReadingsRef.current;
      if (readings.length >= config.minReadingsPerPhase) {
        const elapsed = (Date.now() - phaseStartRef.current) / 1000;
        const minTemp = Math.min(...readings.map((r) => r.temperature));
        const deltaT = baselineTemp !== null ? baselineTemp - minTemp : null;

        const passed = deltaT !== null && deltaT >= config.coldWaterDeltaThreshold;
        const timedOut = elapsed >= config.coldWaterTimeoutSec;

        if (passed || timedOut) {
          const capture: PhaseCapture = {
            startedAt: phaseStartRef.current,
            endedAt: Date.now(),
            readings: [...readings],
            minTemperature: Math.round(minTemp * 100) / 100,
            maxTemperature: Math.round(Math.max(...readings.map((r) => r.temperature)) * 100) / 100,
            deltaT: deltaT !== null ? Math.round(deltaT * 100) / 100 : null,
            durationSec: Math.round(elapsed * 10) / 10,
            passed,
          };
          setColdCapture(capture);
          setPhase("cold_water_done");
        }
      }
      return;
    }

    // WARM WATER: capture readings until a threshold rise is detected
    if (phase === "warm_water") {
      phaseReadingsRef.current.push({ timestamp: Date.now(), temperature: currentTemperature });

      const readings = phaseReadingsRef.current;
      if (readings.length >= config.minReadingsPerPhase) {
        const elapsed = (Date.now() - phaseStartRef.current) / 1000;
        const maxTemp = Math.max(...readings.map((r) => r.temperature));
        const deltaT = baselineTemp !== null ? maxTemp - baselineTemp : null;

        const passed = deltaT !== null && deltaT >= config.warmWaterDeltaThreshold;
        const timedOut = elapsed >= config.warmWaterTimeoutSec;

        if (passed || timedOut) {
          const capture: PhaseCapture = {
            startedAt: phaseStartRef.current,
            endedAt: Date.now(),
            readings: [...readings],
            minTemperature: Math.round(Math.min(...readings.map((r) => r.temperature)) * 100) / 100,
            maxTemperature: Math.round(maxTemp * 100) / 100,
            deltaT: deltaT !== null ? Math.round(deltaT * 100) / 100 : null,
            durationSec: Math.round(elapsed * 10) / 10,
            passed,
          };
          setWarmCapture(capture);
          setPhase("warm_water_done");

          // Auto-trigger completion if both passed
          if (passed && coldCapture?.passed) {
            setPhase("complete");
          } else {
            setPhase("needs_retry");
          }
        }
      }
    }
  }, [currentTemperature, phase, baselineReadings, config, baselineTemp, coldCapture]);

  /* -----------------------------------------------------------------------
   * Hardware disconnect detection
   * ----------------------------------------------------------------------- */
  useEffect(() => {
    if (hwStatus === "disconnected" || hwStatus === "error") {
      if (phase !== "idle" && phase !== "complete" && phase !== "cold_water_done" && phase !== "warm_water_done") {
        setPhase("error");
      }
    }
  }, [hwStatus, phase]);

  /* -----------------------------------------------------------------------
   * Validation checks (computed, not stored)
   * ----------------------------------------------------------------------- */
  const validationChecks: ValidationCheck[] = useMemo(() => {
    return runAllChecks({
      hwStatus,
      allTemperatures: allReadings,
      baselineTemp,
      baselineReadings,
      coldCapture,
      warmCapture,
      config,
    });
  }, [hwStatus, allReadings, baselineTemp, baselineReadings, coldCapture, warmCapture, config]);

  /* -----------------------------------------------------------------------
   * Gemma post-experiment analysis
   * ----------------------------------------------------------------------- */
  const requestGemmaAnalysis = useCallback(async () => {
    if (phase !== "complete" && phase !== "needs_retry" && phase !== "error") return;
    setGemmaLoading(true);
    setGemmaError(false);

    const metrics = buildExperimentMetrics({
      studentName,
      studentAge,
      baselineTemp,
      coldCapture,
      warmCapture,
      isRealHardware,
      status: phase === "complete" ? "successful" : "needs_retry",
    });

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
            stepTitle: "Experiment",
            stepKind: "experiment",
            stepIndex: 4,
            lessonKnowledge: "",
          },
          messages: [
            {
              id: "exp-user",
              role: "user",
              text: `My temperature sensor experiment is ${phase === "complete" ? "complete" : "needs retry"}. Here are my results as JSON:\n${JSON.stringify(metrics, null, 2)}\n\nPlease explain what my results mean and what I should notice about the temperature changes.`,
              status: "success",
              createdAt: Date.now(),
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = (await res.json()) as { text: string };
      setGemmaAnalysis(data.text);
    } catch {
      setGemmaError(true);
    } finally {
      setGemmaLoading(false);
    }
  }, [phase, studentName, studentAge, baselineTemp, coldCapture, warmCapture, isRealHardware]);

  const requestGemmaTroubleshooting = useCallback(async () => {
    setGemmaLoading(true);
    setGemmaError(false);

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
            stepTitle: "Experiment",
            stepKind: "experiment",
            stepIndex: 4,
            lessonKnowledge: "",
          },
          messages: [
            {
              id: "ts-user",
              role: "user",
              text: `My temperature sensor experiment needs help. Current phase: ${phase}. Hardware status: ${hwStatus}. I need troubleshooting steps to fix this.`,
              status: "success",
              createdAt: Date.now(),
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = (await res.json()) as { text: string };
      setGemmaAnalysis(data.text);
    } catch {
      setGemmaError(true);
    } finally {
      setGemmaLoading(false);
    }
  }, [phase, hwStatus, studentName, studentAge]);

  return {
    phase,
    baselineTemp,
    baselineReadings,
    coldCapture,
    warmCapture,
    validationChecks,
    gemmaAnalysis,
    gemmaLoading,
    gemmaError,
    startBaseline,
    startColdWater,
    startWarmWater,
    resetExperiment,
    requestGemmaAnalysis,
    requestGemmaTroubleshooting,
  };
}
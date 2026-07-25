"use client";

import { useCallback, useRef, useState } from "react";
import type { HardwareProvider } from "@/lib/hardware/provider";
import type { ConnectionStatus, SensorReading } from "@/lib/hardware/types";
import type { SimulationScenario } from "@/lib/hardware/simulation-provider";
import { MAX_HISTORY_LENGTH } from "@/lib/hardware/types";
import type { HistoryPoint } from "@/components/hardware/TemperatureGraph";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { TemperatureGraph } from "./TemperatureGraph";
import { Esp32WebSocketProvider } from "@/lib/hardware/esp32-provider";
import { SimulationProvider } from "@/lib/hardware/simulation-provider";

/* -----------------------------------------------------------------------
 * useHardwareConnection hook
 * ----------------------------------------------------------------------- */

const SIM_SCENARIOS: { value: SimulationScenario; label: string }[] = [
  { value: "stable", label: "Stable" },
  { value: "increasing", label: "Warming up" },
  { value: "decreasing", label: "Cooling down" },
  { value: "volatile", label: "Volatile" },
];

export function useHardwareConnection() {
  const [mode, setMode] = useState<"simulation" | "hardware">("simulation");
  const [url, setUrl] = useState("ws://10.176.14.176/ws");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [info, setInfo] = useState<string | null>(null);
  const [simScenario, setSimScenario] = useState<SimulationScenario>("stable");

  const providerRef = useRef<HardwareProvider | null>(null);

  const pushReading = useCallback((r: SensorReading) => {
    const temp = r.temperatureDS18B20 ?? r.temperatureDHT11;
    if (temp === null) return;
    setReading(r);
    setHistory((prev) => {
      const next = [...prev, { timestamp: r.timestamp, value: temp }];
      if (next.length > MAX_HISTORY_LENGTH) return next.slice(-MAX_HISTORY_LENGTH);
      return next;
    });
  }, []);

  const createProvider = useCallback(
    (m: "simulation" | "hardware"): HardwareProvider => {
      return m === "simulation" ? new SimulationProvider() : new Esp32WebSocketProvider();
    },
    [],
  );

  const connect = useCallback(
    async (deviceUrl?: string) => {
      const target = deviceUrl ?? url;
      if (!target.trim()) return;

      // Tear down existing
      if (providerRef.current) {
        providerRef.current.disconnect();
      }
      setHistory([]);
      setReading(null);
      setInfo(null);

      const provider = createProvider(mode);
      providerRef.current = provider;

      const unsub = provider.subscribeToUpdates((r) => {
        pushReading(r);
      });

      // Poll status
      const statusTimer = setInterval(() => {
        setStatus(provider.getConnectionStatus());
        if (provider.getConnectionStatus() === "connected" && provider.getHardwareInfo()) {
          const hi = provider.getHardwareInfo()!;
          setInfo(`${hi.deviceName} · v${hi.firmwareVersion}`);
        }
      }, 300);

      try {
        await provider.connect(target);
      } catch {
        // connect may throw; status polling will surface it.
      }

      // Cleanup on disconnect
      const cleanup = () => {
        clearInterval(statusTimer);
        unsub();
        provider.disconnect();
      };
      // Store cleanup for next connect/disconnect calls.
      (providerRef as { current: HardwareProvider | null; _cleanup?: () => void }).current = provider;
      (providerRef as unknown as { _cleanup?: () => void })._cleanup = cleanup;
    },
    [url, mode, createProvider, pushReading],
  );

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    setStatus("disconnected");
    setInfo(null);
  }, []);

  const switchMode = useCallback(
    (m: "simulation" | "hardware") => {
      disconnect();
      setMode(m);
      setHistory([]);
      setReading(null);
    },
    [disconnect],
  );

  const isSim = mode === "simulation";

  return {
    mode,
    url,
    setUrl,
    status,
    reading,
    history,
    info,
    simScenario,
    setSimScenario,
    SIM_SCENARIOS,
    isSim,
    connect,
    disconnect,
    switchMode,
    providerRef, // for accessing scenario setter on simulation
  };
}

/* -----------------------------------------------------------------------
 * HardwarePanel component
 * ----------------------------------------------------------------------- */

interface HardwarePanelProps {
  hook: ReturnType<typeof useHardwareConnection>;
}

export function HardwarePanel({ hook }: HardwarePanelProps) {
  const {
    mode,
    url,
    setUrl,
    status,
    reading,
    history,
    info,
    simScenario,
    setSimScenario,
    SIM_SCENARIOS,
    isSim,
    connect,
    disconnect,
    switchMode,
    providerRef,
  } = hook;

  const isConnected = status === "connected";
  const isBusy = status === "connecting" || status === "reconnecting";

  const temp = reading?.temperatureDS18B20 ?? reading?.temperatureDHT11;

  const handleScenarioChange = (s: SimulationScenario) => {
    setSimScenario(s);
    // The simulation provider exposes setScenario — apply it if we're in sim mode.
    const p = providerRef.current;
    if (isSim && p && "setScenario" in p) {
      (p as SimulationProvider).setScenario(s);
    }
  };

  return (
    <div className="animate-stem-fade-up space-y-6">
      {/* Mode + status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <button
              type="button"
              onClick={() => switchMode("simulation")}
              className={`px-3.5 py-2 text-xs font-semibold transition ${
                mode === "simulation"
                  ? "bg-[var(--primary)] text-[var(--surface)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Simulation
            </button>
            <button
              type="button"
              onClick={() => switchMode("hardware")}
              className={`px-3.5 py-2 text-xs font-semibold transition ${
                mode === "hardware"
                  ? "bg-[var(--primary)] text-[var(--surface)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Real Hardware
            </button>
          </div>
          <ConnectionStatusBadge status={status} />
        </div>
        {isSim ? (
          <span className="rounded-full bg-[var(--secondary-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--secondary)]">
            Simulation
          </span>
        ) : null}
      </div>

      {/* Connection controls */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="hw-url" className="mb-1 block text-xs font-semibold text-[var(--muted)]">
            Device WebSocket URL
          </label>
          <input
            id="hw-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ws://10.176.14.176/ws"
            disabled={isConnected || isBusy}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm font-mono text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] disabled:opacity-60"
          />
        </div>
        {isConnected || isBusy ? (
          <button
            type="button"
            onClick={disconnect}
            className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-2)]"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void connect()}
            disabled={!url.trim()}
            className="shrink-0 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--primary-ink)] disabled:bg-[var(--lock)]"
          >
            Connect
          </button>
        )}
      </div>

      {/* Simulation scenario picker */}
      {isSim && isConnected ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--muted)]">Scenario:</span>
          {SIM_SCENARIOS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => handleScenarioChange(s.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                simScenario === s.value
                  ? "bg-[var(--primary-soft)] text-[var(--primary-ink)]"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Device info */}
      {info ? (
        <p className="text-xs text-[var(--muted)]">{info}</p>
      ) : null}

      {/* Big temperature display */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Temperature (DS18B20)</p>
          <p className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {temp != null ? (
              <>
                {temp.toFixed(1)}
                <span className="text-2xl text-[var(--muted)]"> °C</span>
              </>
            ) : (
              <span className="text-2xl text-[var(--muted)]">--.- °C</span>
            )}
          </p>
        </div>
        {temp != null && reading ? (
          <div className="shrink-0 rounded-full bg-[var(--primary-soft)] px-4 py-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Last update</span>
            <p className="text-sm font-semibold text-[var(--primary-ink)]">
              {new Date(reading.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : null}
      </div>

      {/* Temperature graph */}
      <TemperatureGraph history={history} height={160} />

      {history.length > 0 ? (
        <p className="text-xs text-[var(--muted)]">
          {history.length} reading{history.length === 1 ? "" : "s"} captured
          {isSim ? " (simulation)" : " (real hardware)"}
        </p>
      ) : null}
    </div>
  );
}
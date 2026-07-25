"use client";

import { useMemo } from "react";

export interface HistoryPoint {
  timestamp: number;
  value: number;
}

interface TemperatureGraphProps {
  history: HistoryPoint[];
  /** Height in pixels (width auto-fills the parent). */
  height?: number;
}

export function TemperatureGraph({ history, height = 140 }: TemperatureGraphProps) {
  const { pathD, latestPoint } = useMemo(() => {
    if (history.length < 2) return { pathD: "", latestPoint: null };
    const values = history.map((p) => p.value);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    const range = max - min || 1;
    const total = history.length - 1;

    let d = "";
    history.forEach((p, i) => {
      const x = (i / total) * 100;
      const y = 100 - ((p.value - min) / range) * 100;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    });

    const last = history[history.length - 1];
    const lastY = 100 - ((last.value - min) / range) * 100;

    return { pathD: d.trim(), latestPoint: { x: 100, y: lastY } };
  }, [history]);

  const first = history[0];
  const latest = history[history.length - 1];

  if (history.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]"
        style={{ height }}
      >
        Waiting for readings…
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
      {/* Y-axis labels */}
      <div className="absolute left-2 top-1 text-[10px] text-[var(--muted)]">
        {Math.round(history.reduce((a, b) => Math.max(a, b.value), -Infinity) + 1)} °C
      </div>
      <div className="absolute bottom-1 left-2 text-[10px] text-[var(--muted)]">
        {Math.round(history.reduce((a, b) => Math.min(a, b.value), Infinity) - 1)} °C
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" style={{ height }} aria-label="Temperature history chart">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border)" strokeWidth="0.3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="var(--border)" strokeWidth="0.3" />

          {/* Data line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Area fill under the line */}
          {pathD ? (
            <path
              d={`${pathD} L100 100 L0 100 Z`}
              fill="color-mix(in srgb, var(--primary) 8%, transparent)"
            />
          ) : null}

          {/* Latest point dot */}
          {latestPoint ? (
            <circle cx={latestPoint.x} cy={latestPoint.y} r="2.5" fill="var(--primary)" />
          ) : null}
      </svg>

      {/* First & latest value labels */}
      <div className="absolute bottom-1 right-2 text-right text-[10px] text-[var(--muted)]">
        {latest ? `${latest.value.toFixed(1)} °C ` : ""}
        <span className="opacity-50">{first ? `${first.value.toFixed(1)}` : ""}</span>
      </div>
    </div>
  );
}
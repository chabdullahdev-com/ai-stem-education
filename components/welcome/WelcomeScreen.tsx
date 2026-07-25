"use client";

import { useMemo } from "react";

interface WelcomeScreenProps {
  onStart: () => void;
}

// Lightweight inline STEM motif (AI + sensors + hardware + learning).
// Pure SVG so no extra image assets are required.
function StemMotif() {
  return (
    <svg
      viewBox="0 0 520 520"
      className="h-full w-full"
      role="img"
      aria-label="STEM learning motif: sensors, circuits, and an AI core"
    >
      <defs>
        <radialGradient id="gemma-glow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--secondary)" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="220" r="220" fill="url(#gemma-glow)" />

      {/* outer rotating ring */}
      <g style={{ transformOrigin: "260px 220px" }} className="animate-stem-float">
        <circle cx="260" cy="220" r="180" fill="none" stroke="url(#ring-grad)" strokeWidth="1.5" strokeDasharray="2 10" opacity="0.55" />
        <circle cx="260" cy="220" r="150" fill="none" stroke="var(--primary)" strokeWidth="1" strokeDasharray="1 14" opacity="0.4" />
      </g>

      {/* core AI node */}
      <g className="animate-stem-pulse" style={{ transformOrigin: "260px 220px" }}>
        <circle cx="260" cy="220" r="64" fill="var(--primary)" opacity="0.92" />
        <circle cx="260" cy="220" r="64" fill="none" stroke="var(--surface)" strokeWidth="2" />
        <text x="260" y="232" textAnchor="middle" fontFamily="var(--font-display)" fontSize="34" fontWeight="700" fill="var(--surface)">
          G
        </text>
      </g>

      {/* satellite concept nodes */}
      {[
        { x: 120, y: 150, label: "S", t: "Sensors" },
        { x: 400, y: 150, label: "H", t: "Hardware" },
        { x: 120, y: 320, label: "AI", t: "AI" },
        { x: 400, y: 320, label: "L", t: "Learning" },
      ].map((n, i) => (
        <g key={n.t} className="animate-stem-float" style={{ transformOrigin: `${n.x}px ${n.y}px`, animationDelay: `${i * 0.4}s` }}>
          <circle cx={n.x} cy={n.y} r="34" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="34" fill="var(--primary)" opacity="0.12" />
          <text x={n.x} y={n.y + 6} textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fontWeight="700" fill="var(--primary-ink)">
            {n.label}
          </text>
          <text x={n.x} y={n.y + 56} textAnchor="middle" fontFamily="var(--font-body)" fontSize="12" fill="var(--muted)">
            {n.t}
          </text>
        </g>
      ))}

      {/* connecting traces */}
      <g stroke="var(--primary)" strokeWidth="1.5" opacity="0.35">
        <line x1="154" y1="150" x2="200" y2="190" />
        <line x1="366" y1="150" x2="320" y2="190" />
        <line x1="154" y1="320" x2="200" y2="280" />
        <line x1="366" y1="320" x2="320" y2="280" />
      </g>

      {/* temperature pulse waveform */}
      <g transform="translate(120, 440)" opacity="0.7">
        <polyline
          points="0,0 30,0 40,-20 55,25 70,-15 85,10 110,0 280,0"
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text x="260" y="478" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--muted)" letterSpacing="2">
        SENSOR DATA
      </text>
    </svg>
  );
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const conceptTags = useMemo(
    () => ["AI Instructor", "Real Sensors", "MakerBuddy Hardware", "Hands-on Experiments", "Adaptive Lessons"],
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient background */}
      <div className="stem-grid pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: "color-mix(in srgb, var(--secondary) 14%, transparent)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-8">
        {/* Left: copy + CTA */}
        <div className="flex max-w-xl flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            AI · STEM · Ages 5+
          </span>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl">
            Gemma <span className="text-[var(--primary)]">STEM</span>
          </h1>

          <p className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--primary-ink)]">
            Learn. Build. Experiment. Understand.
          </p>

          <p className="text-lg leading-relaxed text-[var(--muted)]">
            Your AI-powered STEM learning companion for exploring real-world science and technology.
          </p>

          <div className="flex flex-wrap gap-2">
            {conceptTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-7 py-3.5 text-base font-semibold text-[var(--surface)] shadow-lg shadow-[color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:bg-[var(--primary-ink)] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
            >
              Start Learning
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 10h12m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-sm text-[var(--muted)]">No account needed — runs locally.</p>
          </div>
        </div>

        {/* Right: STEM visual */}
        <div className="relative w-full max-w-xl">
          <div className="aspect-square w-full">
            <StemMotif />
          </div>
        </div>
      </div>
    </div>
  );
}
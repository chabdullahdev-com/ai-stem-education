"use client";

interface ProgressIndicatorProps {
  /** 0..1 */
  value: number;
  /** optional label shown to the right, e.g. "0% Complete" */
  label?: string;
  /** show the numeric percentage below the bar */
  showCaption?: boolean;
  size?: "sm" | "md";
}

export function ProgressIndicator({ value, label, showCaption = true, size = "md" }: ProgressIndicatorProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const pct = Math.round(clamped * 100);
  const barH = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <div className="h-full w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div
            className={`${barH} rounded-full bg-[var(--primary)] transition-[width] duration-500 ease-out`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        {label ? (
          <span className="shrink-0 text-sm font-semibold text-[var(--foreground)]">{label}</span>
        ) : null}
      </div>
      {showCaption ? (
        <p className="mt-1.5 text-xs text-[var(--muted)]">{pct}% Complete</p>
      ) : null}
    </div>
  );
}
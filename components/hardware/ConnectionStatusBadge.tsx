"use client";

import type { ConnectionStatus } from "@/lib/hardware/types";
import { STATUS_LABELS } from "@/lib/hardware/types";

const COLORS: Record<ConnectionStatus, string> = {
  disconnected: "bg-[var(--lock)]",
  connecting: "bg-[var(--secondary)] animate-stem-pulse",
  connected: "bg-[var(--primary)]",
  error: "bg-[var(--secondary)]",
  reconnecting: "bg-[var(--secondary)] animate-stem-pulse",
};

const TEXT_COLORS: Record<ConnectionStatus, string> = {
  disconnected: "text-[var(--muted)]",
  connecting: "text-[var(--secondary)]",
  connected: "text-[var(--primary-ink)]",
  error: "text-[var(--secondary)]",
  reconnecting: "text-[var(--secondary)]",
};

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${TEXT_COLORS[status]}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${COLORS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
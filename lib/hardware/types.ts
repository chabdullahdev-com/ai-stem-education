/** Hardware domain types — shared between the abstraction, providers, and UI. */

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "reconnecting";

export interface SensorReading {
  /** Epoch ms when the reading was captured (from the hardware, not the browser). */
  timestamp: number;
  /** DS18B20 temperature in degrees Celsius (the primary temp sensor). */
  temperatureDS18B20: number | null;
  /** DHT11 temperature in degrees Celsius (secondary / fallback). */
  temperatureDHT11: number | null;
  /** DHT11 humidity in percent (0–100). */
  humidity: number | null;
  /** Whether this reading came from real hardware (false = simulation). */
  isReal: boolean;
  /** Raw sensor payload for debugging — never shown in production UI. */
  raw?: Record<string, unknown>;
}

export interface HardwareInfo {
  deviceName: string;
  firmwareVersion: string;
  macAddress: string;
  ipAddress: string;
}

export interface SensorHistoryEntry {
  timestamp: number;
  value: number;
}

/** Max readings held in the in-memory history buffer. */
export const MAX_HISTORY_LENGTH = 120;

export const STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting…",
  connected: "Connected",
  error: "Connection error",
  reconnecting: "Reconnecting…",
};

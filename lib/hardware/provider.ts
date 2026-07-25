import type { ConnectionStatus, HardwareInfo, SensorReading } from "./types";

/**
 * Hardware provider abstraction.
 *
 * The UI codes against this interface — never directly against WebSocket,
 * the MakerBuddy protocol, or simulation logic.
 *
 * When the MakerBuddy ESP32 is available, the WebSocket-based provider
 * (makerbuddy-provider.ts) implements this interface. During development we
 * swap in the simulation provider to test the UI without hardware.
 */

export interface HardwareProvider {
  /** Open a connection to the hardware.  The `url` is a WebSocket URI. */
  connect(url: string): Promise<void>;

  /** Gracefully close the connection. */
  disconnect(): void;

  /** Return the current connection status. */
  getConnectionStatus(): ConnectionStatus;

  /** Return the most recent sensor reading, or null if none received yet. */
  getLatestReading(): SensorReading | null;

  /**
   * Subscribe to real-time sensor updates.
   * Returns an unsubscribe function.
   */
  subscribeToUpdates(callback: (reading: SensorReading) => void): () => void;

  /** Return hardware identity info, or null if not yet received. */
  getHardwareInfo(): HardwareInfo | null;

  /** True when the provider is driven by simulated data (never hidden). */
  isSimulation(): boolean;
}

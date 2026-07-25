import type { ConnectionStatus, HardwareInfo, SensorReading } from "./types";
import type { HardwareProvider } from "./provider";

/**
 * Simulation hardware provider — for development and testing without the
 * ESP32 IoT kit plugged in.
 *
 * This provider is ALWAYS clearly flagged (isSimulation() === true, the UI
 * renders a SIMULATION badge). It never pretends to be real hardware.
 */

export type SimulationScenario = "stable" | "decreasing" | "increasing" | "volatile";

function scenarioBaseTemp(s: SimulationScenario): number {
  switch (s) {
    case "decreasing":
      return 38; // starts warm, cools down
    case "increasing":
      return 15; // starts cool, warms up
    case "volatile":
      return 22;
    default:
      return 22.5;
  }
}

export class SimulationProvider implements HardwareProvider {
  private status: ConnectionStatus = "disconnected";
  private latestReading: SensorReading | null = null;
  private subscribers = new Set<(r: SensorReading) => void>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private tick = 0;
  private scenario: SimulationScenario = "stable";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async connect(_url: string): Promise<void> {
    this.tick = 0;
    this.setStatus("connected");

    // Produce a reading every 1.5 s (faster than the ESP32's 2 s, but
    // fine for simulation).
    this.interval = setInterval(() => {
      this.tick++;
      const base = scenarioBaseTemp(this.scenario);

      let temp: number;
      if (this.scenario === "decreasing") {
        temp = base - this.tick * 0.25;
      } else if (this.scenario === "increasing") {
        temp = base + this.tick * 0.25;
      } else if (this.scenario === "volatile") {
        temp = base + Math.sin(this.tick * 0.6) * 4 + (Math.random() - 0.5) * 1.5;
      } else {
        temp = base + (Math.random() - 0.5) * 0.6;
      }

      const reading: SensorReading = {
        timestamp: Date.now(),
        temperatureDS18B20: Math.round(temp * 100) / 100,
        temperatureDHT11: Math.round((temp - 0.3 + (Math.random() - 0.5) * 0.8) * 100) / 100,
        humidity: Math.round(48 + Math.sin(this.tick * 0.1) * 8 + (Math.random() - 0.5) * 3),
        isReal: false,
      };

      this.latestReading = reading;
      for (const cb of this.subscribers) cb(reading);
    }, 1500);
  }

  disconnect(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.setStatus("disconnected");
  }

  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  getLatestReading(): SensorReading | null {
    return this.latestReading;
  }

  subscribeToUpdates(cb: (r: SensorReading) => void): () => void {
    this.subscribers.add(cb);
    return () => { this.subscribers.delete(cb); };
  }

  getHardwareInfo(): HardwareInfo | null {
    return {
      deviceName: "Simulation",
      firmwareVersion: "—",
      macAddress: "—",
      ipAddress: "—",
    };
  }

  isSimulation(): boolean {
    return true;
  }

  /** Switch the simulation scenario at runtime. */
  setScenario(scenario: SimulationScenario): void {
    this.scenario = scenario;
    this.tick = 0;
  }

  /** Return the active scenario name (for UI display). */
  getScenario(): SimulationScenario {
    return this.scenario;
  }

  /* ------ internals ------ */

  private setStatus(s: ConnectionStatus): void {
    this.status = s;
  }
}

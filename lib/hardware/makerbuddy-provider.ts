import type { ConnectionStatus, HardwareInfo, SensorReading } from "./types";
import type { HardwareProvider } from "./provider";

/**
 * MakerBuddy hardware provider — the ONLY place that knows about the
 * MakerBuddy WebSocket protocol, the compact JSON message format, and
 * the sensor mapping (d8 = DS18B20, te = DHT11, etc.).
 *
 * Connects to the MakerBuddy ESP32 over Wi-Fi + WebSocket.
 */

/* -----------------------------------------------------------------------
 * MakerBuddy compact-JSON message shapes (partial — only what we consume).
 * ----------------------------------------------------------------------- */
interface MbDeviceInfo {
  m: "i";
  dn: string;  // device name
  fv: string;  // firmware version
  ip: string;  // IP address
  mc: string;  // MAC address
}

interface MbSensorData {
  m: "s";
  d8?: number; // DS18B20 temperature (°C)
  te?: number; // DHT11 temperature (°C)
  hu?: number; // DHT11 humidity (%)
}

type MbMessage = MbDeviceInfo | MbSensorData;

/* -----------------------------------------------------------------------
 * Reconnection constants
 * ----------------------------------------------------------------------- */
const BASE_RECONNECT_MS = 1500;
const MAX_RECONNECT_MS = 15_000;

/* -----------------------------------------------------------------------
 * isValidNumber — guards against NaN / -Infinity / obviously-sensorless.
 * MakerBuddy sends -127 when a sensor is not connected.
 * ----------------------------------------------------------------------- */
function isValidNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > -100;
}

export class MakerBuddyProvider implements HardwareProvider {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private latestReading: SensorReading | null = null;
  private deviceInfo: HardwareInfo | null = null;
  private subscribers = new Set<(r: SensorReading) => void>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = BASE_RECONNECT_MS;
  private currentUrl: string | null = null;
  private shouldReconnect = false;

  /* ------ Connection lifecycle ------ */

  async connect(url: string): Promise<void> {
    this.disconnect(); // tear down any previous connection
    this.currentUrl = url;
    this.shouldReconnect = true;
    this.reconnectDelay = BASE_RECONNECT_MS;
    this.setStatus("connecting");
    this.openSocket(url);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnect();
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
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
    return this.deviceInfo;
  }

  isSimulation(): boolean {
    return false;
  }

  /* ------ Internals ------ */

  private setStatus(next: ConnectionStatus): void {
    this.status = next;
  }

  private openSocket(url: string): void {
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this.handleConnectionFailure();
      return;
    }
    this.socket = ws;

    ws.onopen = () => {
      this.reconnectDelay = BASE_RECONNECT_MS;
      this.setStatus("connected");
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      this.handleMessage(event.data);
    };

    ws.onerror = () => {
      // onclose will fire next; we handle closure there.
    };

    ws.onclose = () => {
      this.socket = null;
      this.deviceInfo = null; // stale — will be re-fetched on reconnect
      if (this.shouldReconnect) {
        this.setStatus("reconnecting");
        this.scheduleReconnect();
      } else {
        this.setStatus("disconnected");
      }
    };
  }

  private handleMessage(raw: string): void {
    let msg: MbMessage;
    try {
      msg = JSON.parse(raw) as MbMessage;
    } catch {
      return; // ignore un-parseable fragments
    }

    // Device info
    if (msg.m === "i") {
      this.deviceInfo = {
        deviceName: msg.dn ?? "Unknown",
        firmwareVersion: msg.fv ?? "?",
        macAddress: msg.mc ?? "?",
        ipAddress: msg.ip ?? "?",
      };
      return;
    }

    // Sensor data
    if (msg.m === "s") {
      const reading: SensorReading = {
        timestamp: Date.now(),
        temperatureDS18B20: isValidNumber(msg.d8) ? msg.d8 : null,
        temperatureDHT11: isValidNumber(msg.te) ? msg.te : null,
        humidity: isValidNumber(msg.hu) ? msg.hu : null,
        isReal: true,
        raw: msg as unknown as Record<string, unknown>,
      };
      this.latestReading = reading;
      for (const cb of this.subscribers) cb(reading);
    }
  }

  private handleConnectionFailure(): void {
    this.setStatus("error");
    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldReconnect && this.currentUrl) {
        this.openSocket(this.currentUrl);
      }
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, MAX_RECONNECT_MS);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

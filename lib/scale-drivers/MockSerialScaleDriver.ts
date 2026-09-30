import { IScaleDriver, WeightUpdateCallback } from "./IScaleDriver";
import type { ScaleStatus, WeightReading } from "./WeightReading";

const STABLE_THRESHOLD = 0.04;

export class MockSerialScaleDriver implements IScaleDriver {
  private callbacks = new Set<WeightUpdateCallback>();
  private intervalId: number | null = null;
  private status: ScaleStatus = "disconnected";

  constructor(private readonly updateInterval = 300) {}

  async connect(): Promise<void> {
    if (this.status === "connected") {
      return;
    }

    this.status = "connecting";
    await new Promise<void>((resolve) => setTimeout(resolve, 120));
    this.status = "connected";

    this.intervalId = window.setInterval(() => {
      const value = 5 + Math.sin(Date.now() / 1800) * 2 + Math.random() * 0.08;
      const rounded = Number(value.toFixed(2));
      const stable = Math.abs(value - rounded) < STABLE_THRESHOLD;
      const reading: WeightReading = {
        valueKg: rounded,
        stable,
        status: stable ? "stable" : "unstable",
        timestamp: Date.now(),
        rawPayload: `MOCK:${rounded.toFixed(2)}`,
      };

      this.callbacks.forEach((callback) => callback(reading));
    }, this.updateInterval);
  }

  async disconnect(): Promise<void> {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.status = "disconnected";
  }

  onWeightUpdate(callback: WeightUpdateCallback): void {
    this.callbacks.add(callback);
  }

  removeWeightUpdate(callback: WeightUpdateCallback): void {
    this.callbacks.delete(callback);
  }

  getStatus(): ScaleStatus {
    return this.status;
  }
}

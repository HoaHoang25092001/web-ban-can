import { IScaleDriver, WeightUpdateCallback } from "./IScaleDriver";
import { createParser } from "./ScaleParserFactory";
import type { ScaleModel } from "./ScaleModel";
import type { ScaleStatus, WeightReading } from "./WeightReading";
import type { IScaleParser } from "./ScaleParser";

interface WebSerialDriverOptions {
  baudRate?: number;
  scaleModel?: ScaleModel;
}

type SerialPortLike = {
  open(options: { baudRate: number }): Promise<void>;
  readable?: ReadableStream<Uint8Array>;
  writable?: WritableStream<Uint8Array>;
  close?: () => Promise<void>;
};

type NavigatorWithSerial = Navigator & {
  serial?: {
    requestPort(): Promise<SerialPortLike>;
  };
};

const DEFAULT_BAUD_RATE = 9600;

export class WebSerialScaleDriver implements IScaleDriver {
  private callbacks = new Set<WeightUpdateCallback>();
  private port: SerialPortLike | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private status: ScaleStatus = "disconnected";
  private readonly parser: IScaleParser;

  constructor(private readonly options: WebSerialDriverOptions = {}) {
    this.parser = createParser(options.scaleModel ?? "generic-text");
  }

  async connect(): Promise<void> {
    const navigatorWithSerial = navigator as NavigatorWithSerial;

    if (!navigatorWithSerial?.serial) {
      this.status = "error";
      throw new Error("Web Serial API is not available in this browser");
    }

    if (this.status === "connected") {
      return;
    }

    this.status = "connecting";
    this.port = await navigatorWithSerial.serial.requestPort();
    await this.port.open({
      baudRate: this.options.baudRate ?? DEFAULT_BAUD_RATE,
    });

    if (!this.port?.readable) {
      this.status = "error";
      throw new Error("Serial port is not readable");
    }

    this.status = "connected";
    void this.startReading();
  }

  async disconnect(): Promise<void> {
    this.status = "disconnected";

    if (this.reader) {
      await this.reader.cancel().catch(() => {});
      this.reader = null;
    }

    if (typeof this.port?.close === "function") {
      await this.port.close().catch(() => {});
    }

    this.port = null;
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

  private async startReading(): Promise<void> {
    if (!this.port?.readable) {
      return;
    }

    const streamReader = this.port.readable.getReader();
    this.reader = streamReader;
    this.parser.reset();

    while (this.status === "connected") {
      const result = await streamReader.read();
      if (result.done) {
        break;
      }

      if (!result.value) {
        continue;
      }

      const readings = this.parser.feed(result.value);
      for (const reading of readings) {
        this.callbacks.forEach((callback) => callback(reading));
      }
    }
  }

  private parseLine(line: string): WeightReading | null {
    const payload = line.trim();
    if (payload.length === 0) {
      return null;
    }

    const match = payload.match(/(-?\d+(?:\.\d+)?)/);
    if (!match) {
      return null;
    }

    const valueKg = Number(match[1]);
    if (Number.isNaN(valueKg)) {
      return null;
    }

    const stable = /\b(S|STABLE)\b/i.test(payload);

    return {
      valueKg,
      stable,
      status: stable ? "stable" : "unstable",
      timestamp: Date.now(),
      rawPayload: payload,
    };
  }
}

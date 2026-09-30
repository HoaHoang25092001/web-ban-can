import { IScaleParser } from "./ScaleParser";
import type { WeightReading } from "./WeightReading";

const FRAME_LENGTH = 12;

export class YaohuaT3WeightParser implements IScaleParser {
  private buffer: number[] = [];

  feed(chunk: Uint8Array): WeightReading[] {
    const output: WeightReading[] = [];
    this.buffer.push(...chunk);

    while (this.buffer.length >= FRAME_LENGTH) {
      const frame = this.buffer.slice(0, FRAME_LENGTH);
      const ascii = String.fromCharCode(...frame);
      const reading = this.tryParseFrame(ascii);

      if (reading) {
        output.push(reading);
        this.buffer = this.buffer.slice(FRAME_LENGTH);
      } else {
        this.buffer.shift();
      }
    }

    return output;
  }

  reset(): void {
    this.buffer = [];
  }

  private tryParseFrame(ascii: string): WeightReading | null {
    const trimmed = ascii.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const candidate = trimmed.slice(2, -2).trim();
    let value = parseFloat(candidate);

    if (Number.isNaN(value)) {
      const regexMatch = trimmed.match(/(-?\d+(?:\.\d+)?)/);
      if (!regexMatch) {
        return null;
      }
      value = parseFloat(regexMatch[1]);
      if (Number.isNaN(value)) {
        return null;
      }
    }

    const weightKg = value / 1000;

    return {
      valueKg: Number(weightKg),
      stable: true,
      status: "stable",
      timestamp: Date.now(),
      rawPayload: trimmed,
    };
  }
}

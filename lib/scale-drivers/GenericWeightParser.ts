import { IScaleParser } from "./ScaleParser";
import type { WeightReading } from "./WeightReading";

const LINE_BREAK_REGEX = /[\r\n]+/;

export class GenericWeightParser implements IScaleParser {
  private decoder = new TextDecoder();
  private buffer = "";

  feed(chunk: Uint8Array): WeightReading[] {
    const output: WeightReading[] = [];
    this.buffer += this.decoder.decode(chunk, { stream: true });

    const lines = this.buffer.split(LINE_BREAK_REGEX);
    this.buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const reading = this.tryParseLine(rawLine.trim());
      if (reading) {
        output.push(reading);
      }
    }

    return output;
  }

  reset(): void {
    this.buffer = "";
  }

  private tryParseLine(rawLine: string): WeightReading | null {
    if (rawLine.length === 0) {
      return null;
    }

    const match = rawLine.match(/(-?\d+(?:\.\d+)?)/);
    if (!match) {
      return null;
    }

    const valueKg = Number(match[1]);
    if (Number.isNaN(valueKg)) {
      return null;
    }

    const stable = /\b(S|STABLE)\b/i.test(rawLine);

    return {
      valueKg,
      stable,
      status: stable ? "stable" : "unstable",
      timestamp: Date.now(),
      rawPayload: rawLine,
    };
  }
}

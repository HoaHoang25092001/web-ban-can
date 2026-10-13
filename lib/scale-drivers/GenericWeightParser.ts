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

    /*
     * Ổn định khi có "ST" (chuẩn chung của đầu cân: "ST,GS,+0012.50kg"; còn
     * "US" là đang dao động), "S" hoặc "STABLE". Bản trước thiếu "ST" nên cân
     * đứng yên vẫn báo "Đang dao động" và mỗi lần bấm lưu đều bị hỏi lại.
     */
    const stable = /\b(ST|S|STABLE)\b/i.test(rawLine);

    // Đếm số lẻ trên chuỗi gốc, trước khi đổi sang số: "+0012.500" → 3.
    const decimals = match[1].split(".")[1]?.length ?? 0;

    return {
      valueKg,
      decimals,
      stable,
      status: stable ? "stable" : "unstable",
      timestamp: Date.now(),
      rawPayload: rawLine,
    };
  }
}

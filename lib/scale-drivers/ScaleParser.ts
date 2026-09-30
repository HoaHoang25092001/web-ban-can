import type { WeightReading } from "./WeightReading";

export interface IScaleParser {
  feed(chunk: Uint8Array): WeightReading[];
  reset(): void;
}

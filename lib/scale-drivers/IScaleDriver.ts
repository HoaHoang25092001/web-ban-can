import type { ScaleStatus, WeightReading } from "./WeightReading";

export type WeightUpdateCallback = (reading: WeightReading) => void;
export type ScaleDriverType = "web-serial";

export interface IScaleDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onWeightUpdate(callback: WeightUpdateCallback): void;
  removeWeightUpdate(callback: WeightUpdateCallback): void;
  getStatus(): ScaleStatus;
}

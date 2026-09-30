export type ScaleState = "stable" | "unstable" | "error";
export type ScaleStatus = "connected" | "disconnected" | "connecting" | "error";

export interface WeightReading {
  valueKg: number;
  stable: boolean;
  status: ScaleState;
  timestamp: number;
  rawPayload?: string;
}

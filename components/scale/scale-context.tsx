"use client";

import { type ReactNode, createContext, useContext } from "react";

import type { ScaleModel } from "@/lib/scale-drivers/ScaleModel";
import type { ScaleStatus, WeightReading } from "@/lib/scale-drivers/WeightReading";
import { useScaleDriver } from "@/lib/scale-drivers/useScaleDriver";

export type ScaleContextValue = {
  reading: WeightReading | null;
  status: ScaleStatus;
  error?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  hasWebSerial: boolean | null;
  scaleModel: ScaleModel;
  setScaleModel: (model: ScaleModel) => void;
};

const ScaleContext = createContext<ScaleContextValue | null>(null);

export function ScaleProvider({ children }: { children: ReactNode }) {
  const scale = useScaleDriver({ baudRate: 9600 });

  return (
    <ScaleContext.Provider value={scale}>{children}</ScaleContext.Provider>
  );
}

export function useScaleContext() {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error("useScaleContext must be used within ScaleProvider");
  }
  return context;
}

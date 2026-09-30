"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { ScaleDriverFactory } from "@/lib/scale-drivers/ScaleDriverFactory";
import type { ScaleModel } from "@/lib/scale-drivers/ScaleModel";
import type { ScaleStatus, WeightReading } from "@/lib/scale-drivers/WeightReading";

export interface UseScaleDriverOptions {
  baudRate?: number;
  scaleModel?: ScaleModel;
}

// Driver/Web Serial errors are English DOMExceptions; map the common ones to
// messages that say what happened and how to fix it.
function describeConnectError(caught: unknown): string {
  const name = caught instanceof Error ? caught.name : "";
  const message = caught instanceof Error ? caught.message : String(caught);

  if (name === "NotFoundError") {
    return "Bạn chưa chọn cổng của cân. Nhấn “Kết nối cân” rồi chọn cổng COM/USB của cân trong hộp thoại của trình duyệt.";
  }
  if (name === "InvalidStateError") {
    return "Cổng này đang được mở ở tab hoặc phần mềm khác. Hãy đóng nơi đó rồi thử lại.";
  }
  if (name === "NetworkError") {
    return "Không mở được cổng. Kiểm tra cáp nối cân, hoặc đóng phần mềm khác đang dùng cổng này rồi thử lại.";
  }
  if (name === "SecurityError") {
    return "Trình duyệt chặn truy cập cổng. Hãy mở trang bằng địa chỉ http://localhost trên máy nối với cân.";
  }
  if (/Web Serial API is not available/i.test(message)) {
    return "Trình duyệt này không hỗ trợ kết nối cân. Hãy dùng Google Chrome hoặc Microsoft Edge.";
  }
  if (/not readable/i.test(message)) {
    return "Đã mở cổng nhưng không đọc được dữ liệu. Kiểm tra cân đã bật và đúng loại cân.";
  }
  return `Không kết nối được với cân. Chi tiết: ${message || "lỗi không xác định"}.`;
}

export function useScaleDriver(options: UseScaleDriverOptions) {
  const { baudRate = 9600 } = options;
  const [scaleModel, setScaleModelState] = useState<ScaleModel>(
    options.scaleModel ?? "generic-text",
  );
  const [reading, setReading] = useState<WeightReading | null>(null);
  const [status, setStatus] = useState<ScaleStatus>("disconnected");
  const [error, setError] = useState<string | undefined>(undefined);

  const driver = useMemo(
    () => ScaleDriverFactory.create("web-serial", { baudRate, scaleModel }),
    [baudRate, scaleModel],
  );

  const hasWebSerial = useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== "undefined" && "serial" in navigator,
    () => false,
  );

  const connect = useCallback(async () => {
    setError(undefined);
    setStatus("connecting");
    try {
      await driver.connect();
      setStatus(driver.getStatus());
    } catch (caught) {
      setError(describeConnectError(caught));
      setStatus("error");
    }
  }, [driver]);

  const disconnect = useCallback(async () => {
    await driver.disconnect();
    setReading(null);
    setStatus(driver.getStatus());
  }, [driver]);

  // Changing the model swaps the driver, and the effect cleanup below closes
  // the old port, so reflect that instead of still showing "connected" with
  // a stale reading.
  const setScaleModel = useCallback((model: ScaleModel) => {
    setScaleModelState(model);
    setReading(null);
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    const callback = (nextReading: WeightReading) => {
      setReading(nextReading);
    };

    driver.onWeightUpdate(callback);

    return () => {
      driver.removeWeightUpdate(callback);
      void driver.disconnect();
    };
  }, [driver]);

  return {
    reading,
    status,
    error,
    connect,
    disconnect,
    isConnected: status === "connected",
    hasWebSerial,
    scaleModel,
    setScaleModel,
  };
}

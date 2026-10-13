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
    return "Chưa chọn cân. Bấm “Kết nối cân” rồi chọn cân trong danh sách hiện ra. Danh sách trống thì kiểm tra cáp (trên điện thoại cần cáp OTG) hoặc Bluetooth của cân đã bật và ghép đôi chưa.";
  }
  if (name === "InvalidStateError") {
    return "Cân đang được mở ở một tab hoặc ứng dụng khác. Hãy đóng nơi đó rồi thử lại.";
  }
  if (name === "NetworkError") {
    return "Không mở được kết nối với cân. Rút cáp ra cắm lại (hoặc tắt bật Bluetooth của cân), đóng ứng dụng khác đang dùng cân, rồi thử lại.";
  }
  if (name === "SecurityError") {
    return "Trình duyệt chặn kết nối với cân. Hãy mở trang bằng địa chỉ có https:// (ví dụ https://cangiare.com/can-dien-tu), không mở từ tệp đã lưu.";
  }
  if (/Web Serial API is not available/i.test(message)) {
    return "Trình duyệt này không hỗ trợ kết nối cân. Trên máy tính dùng Google Chrome hoặc Microsoft Edge; trên Android dùng Google Chrome bản mới.";
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

  // null lúc dựng trên máy chủ = "chưa biết". Trước đây trả false, nên trang
  // vừa tải thoáng hiện cảnh báo "không hỗ trợ" rồi mới biến mất.
  const hasWebSerial = useSyncExternalStore<boolean | null>(
    () => () => {},
    () => typeof navigator !== "undefined" && "serial" in navigator,
    () => null,
  );

  /*
   * Giữ màn hình sáng khi đang nối với cân (Screen Wake Lock API).
   *
   * Trên điện thoại, màn hình tự tắt sau 30 giây không chạm — giữa lúc tay
   * đang bê hàng lên cân, nhìn lại thì màn hình đã tối. Chỉ giữ khi ĐANG kết
   * nối; ngắt kết nối hay chuyển sang ứng dụng khác là trả lại bình thường.
   */
  useEffect(() => {
    if (status !== "connected" || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    type WakeLockLike = { release(): Promise<void> };
    const wl = (navigator as Navigator & { wakeLock: { request(t: "screen"): Promise<WakeLockLike> } }).wakeLock;
    let lock: WakeLockLike | null = null;
    let cancelled = false;
    const acquire = () => {
      if (document.visibilityState !== "visible") return;
      wl.request("screen")
        .then((l) => {
          if (cancelled) void l.release();
          else lock = l;
        })
        .catch(() => {
          // Pin yếu hoặc trình duyệt từ chối — không sao, chỉ là tiện ích.
        });
    };
    acquire();
    // Hệ điều hành tự nhả khoá khi chuyển ứng dụng; quay lại thì xin lại.
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      void lock?.release().catch(() => {});
    };
  }, [status]);

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

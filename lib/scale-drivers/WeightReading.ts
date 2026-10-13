export type ScaleState = "stable" | "unstable" | "error";
export type ScaleStatus = "connected" | "disconnected" | "connecting" | "error";

export interface WeightReading {
  valueKg: number;
  /**
   * Số chữ số thập phân đúng như cân gửi lên: "0.000" là 3, "0.0" là 1, "12" là 0.
   *
   * Phải giữ riêng vì `valueKg` là số — 0.000 và 0.0 đều thành 0, mất luôn độ
   * chia của cân. Cân 3 số lẻ mà màn hình chỉ hiện 2 thì người cân tưởng cân
   * sai; cân 1 số lẻ mà hiện 2 thì thừa một số 0 vô nghĩa. Bỏ trống khi bộ đọc
   * không xác định được — lúc đó dùng mặc định theo loại cân.
   */
  decimals?: number;
  stable: boolean;
  status: ScaleState;
  timestamp: number;
  rawPayload?: string;
}

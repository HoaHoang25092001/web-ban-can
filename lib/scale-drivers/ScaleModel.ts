export type ScaleModel = "generic-text" | "yaohua-t3";

export const SCALE_MODEL_LABELS: Record<ScaleModel, string> = {
  "generic-text": "Generic Text Scale",
  "yaohua-t3": "Yaohua HT9800-T3",
};

/** Số lẻ mặc định khi bộ đọc không biết cân gửi bao nhiêu số lẻ. */
const DEFAULT_DECIMALS: Record<ScaleModel, number> = {
  "generic-text": 2,
  "yaohua-t3": 1,
};

/**
 * Hiện khối lượng đúng số chữ số thập phân của cân.
 *
 * `decimals` lấy từ chính chuỗi cân gửi lên (xem WeightReading.decimals): cân
 * hiện 0.000 thì màn hình cũng 0.000, cân hiện 0.0 thì cũng 0.0 — người cân
 * nhìn hai nơi phải thấy y hệt nhau. Chỉ khi không biết mới dùng mặc định theo
 * loại cân như trước.
 */
export function formatWeightByScaleModel(
  value: number,
  scaleModel: ScaleModel,
  decimals?: number,
): string {
  const places =
    decimals !== undefined && Number.isInteger(decimals) && decimals >= 0 && decimals <= 6
      ? decimals
      : DEFAULT_DECIMALS[scaleModel];
  return value.toFixed(places);
}

export type ScaleModel = "generic-text" | "yaohua-t3";

export const SCALE_MODEL_LABELS: Record<ScaleModel, string> = {
  "generic-text": "Generic Text Scale",
  "yaohua-t3": "Yaohua HT9800-T3",
};

export function formatWeightByScaleModel(
  value: number,
  scaleModel: ScaleModel,
): string {
  const decimalPlaces = scaleModel === "yaohua-t3" ? 1 : 2;
  return value.toFixed(decimalPlaces);
}

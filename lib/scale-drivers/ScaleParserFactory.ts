import { GenericWeightParser } from "./GenericWeightParser";
import { YaohuaT3WeightParser } from "./YaohuaT3WeightParser";
import type { IScaleParser } from "./ScaleParser";
import type { ScaleModel } from "./ScaleModel";

export function createParser(model: ScaleModel): IScaleParser {
  switch (model) {
    case "yaohua-t3":
      return new YaohuaT3WeightParser();
    case "generic-text":
    default:
      return new GenericWeightParser();
  }
}

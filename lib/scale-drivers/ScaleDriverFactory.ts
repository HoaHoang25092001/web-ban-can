import { IScaleDriver, ScaleDriverType } from "./IScaleDriver";
import { WebSerialScaleDriver } from "./WebSerialScaleDriver";
import type { ScaleModel } from "./ScaleModel";

export interface ScaleDriverFactoryOptions {
  baudRate?: number;
  scaleModel?: ScaleModel;
}

export class ScaleDriverFactory {
  static create(
    type: ScaleDriverType,
    options?: ScaleDriverFactoryOptions,
  ): IScaleDriver {
    switch (type) {
      case "web-serial":
      default:
        return new WebSerialScaleDriver(options);
    }
  }
}

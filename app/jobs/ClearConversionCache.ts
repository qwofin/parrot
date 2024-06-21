import { converter } from "~/services/Converter";
import { BaseJob } from "./BaseJob";

export class ClearConversionCacheJob extends BaseJob {
  name = "clear conversion cache"

  async _execute() {
    await converter.clearCache()
  }
}
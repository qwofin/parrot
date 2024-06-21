import { Readarr } from "~/services/Readarr";
import { Syncer } from "~/services/Sync";
import { BaseJob } from "./BaseJob";

export class SyncJob extends BaseJob {
  name = "sync"

  async _execute() {
    const readarrs = await Readarr.getReadarrs()

    for (const readarr of readarrs) {
        await Syncer.syncBooks(readarr)
    }
  }
}
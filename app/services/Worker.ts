import type { Task } from "~/tasks/Task";
import fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { formatDuration } from "~/helpers/formatDuration";

export const q: queueAsPromised<Task> = fastq.promise(asyncWorker, 1);
async function asyncWorker(arg: Task): Promise<void> {
  const start = Date.now();
  console.log(`Starting task`);
  try {
    const result = await arg.execute();
    return result;
  } catch (err) {
    console.log(`Task failed: ${err}`);
  } finally {
    const now = Date.now();
    console.log(`Finished task in ${formatDuration(now - start)}`);
  }
}

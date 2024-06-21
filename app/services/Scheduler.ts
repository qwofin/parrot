import { CronJob } from "cron";
import { ParrotError } from "~/errors";
import { BaseJob } from "~/jobs/BaseJob";

class Scheduler {
  protected jobs: { [id: string]: BaseJob } = {};
  register(schedule: string, job: BaseJob) {
    if (this.jobs[job.name]) {
      throw new ParrotError(`There's already an instance of ${job.name}`);
    }
    console.log(`Registered ${job.name} at ${schedule}`)

    job.cronJob = new CronJob(
      schedule,
      async function () {
        await job.execute();
      },
      null,
      true
    );
    this.jobs[job.name] = job;
  }

  getJob(id: string): BaseJob|null {
    if (id in this.jobs) {
      return this.jobs[id]
    }

    return null
  }

  listJobs() {
    return Object.entries(this.jobs).map(([id, job]) => {
      return {
        id,
        lastRunAt: job.lastExecution,
        nextRunAt: job.cronJob?.nextDate(),
        running: job.isRunning,
      };
    });
  }
}

export const scheduler = new Scheduler();

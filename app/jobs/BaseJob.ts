import { CronJob } from "cron"
import { formatDuration } from "~/helpers/formatDuration"

export abstract class BaseJob {
  isRunning = false
  lastExecution: Date|null = null
  startTime?: Date
  cronJob?: CronJob
  abstract name: string
  abstract _execute(): Promise<void>

  async execute() {
    if (this.isRunning) {
      console.log(`Job ${this.name} is already running`)
      return
    }
    this.isRunning = true
    this.startTime = new Date()
    await this._execute()
    this.isRunning = false
    this.lastExecution = new Date()
    const duration = this.lastExecution.getTime() - this.startTime.getTime()
    console.log(`Job ${this.name} finished in ${formatDuration(duration)}`)
  }
}
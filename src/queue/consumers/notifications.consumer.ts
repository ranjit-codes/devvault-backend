import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationJob } from '../dto/notification-job.dto';

@Processor('notifications')
export class NotificationsConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationsConsumer.name);

  async process(job: Job<NotificationJob, any, string>): Promise<any> {
    this.logger.debug(`Processing notification job: ${job.id}`);

    // Simulate long running background email/notification execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(
      `[SIMULATION] Email sent to user ${job.data.authorId} successfully detailing new resource: ${job.data.resourceTitle}`,
    );

    return { success: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} has completed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} has failed with reason: ${err.message}`,
      err.stack,
    );
  }
}

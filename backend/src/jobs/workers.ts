import { Worker, Job } from 'bullmq';
import { queueRedisConnection } from './queues';
import { logger } from '../config/logger';
import { processNotification } from './processors/notification.processor';
import { processOrderAssignment } from './processors/order-assignment.processor';
import { processDeadlineMonitor } from './processors/deadline-monitor.processor';
import { processDeliverySync } from './processors/delivery-sync.processor';
import { processAnalytics } from './processors/analytics.processor';

// Initialize 5 BullMQ Workers with queueRedisConnection
export const notificationWorker = new Worker(
  'notification-queue',
  processNotification,
  { connection: queueRedisConnection, concurrency: 5 }
);

export const orderAssignmentWorker = new Worker(
  'order-assignment-queue',
  processOrderAssignment,
  { connection: queueRedisConnection, concurrency: 2 }
);

export const deliverySyncWorker = new Worker(
  'delivery-sync-queue',
  processDeliverySync,
  { connection: queueRedisConnection, concurrency: 2 }
);

export const deadlineMonitorWorker = new Worker(
  'deadline-monitor-queue',
  processDeadlineMonitor,
  { connection: queueRedisConnection, concurrency: 1 }
);

export const analyticsWorker = new Worker(
  'analytics-queue',
  processAnalytics,
  { connection: queueRedisConnection, concurrency: 1 }
);

const workers = [
  { name: 'NotificationWorker', worker: notificationWorker },
  { name: 'OrderAssignmentWorker', worker: orderAssignmentWorker },
  { name: 'DeliverySyncWorker', worker: deliverySyncWorker },
  { name: 'DeadlineMonitorWorker', worker: deadlineMonitorWorker },
  { name: 'AnalyticsWorker', worker: analyticsWorker },
];

workers.forEach(({ name, worker }) => {
  worker.on('completed', (job: Job) => {
    logger.info(`[Worker: ${name}] Job #${job.id} (${job.name}) completed successfully`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`[Worker: ${name}] Job #${job?.id || 'N/A'} (${job?.name}) failed:`, err);
  });
});

export const closeAllWorkers = async () => {
  logger.info('Closing all BullMQ workers...');
  await Promise.all(workers.map(({ worker }) => worker.close()));
  logger.info('All BullMQ workers closed successfully.');
};

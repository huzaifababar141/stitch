import { deadlineMonitorQueue, deliverySyncQueue, analyticsQueue } from './queues';
import { logger } from '../config/logger';

export const setupRecurringJobs = async () => {
  logger.info('Setting up recurring cron jobs in BullMQ...');

  // 1. Deadline Monitor: every 30 minutes ('*/30 * * * *')
  await deadlineMonitorQueue.add(
    'check-deadlines',
    {},
    {
      repeat: {
        pattern: '*/30 * * * *',
      },
      jobId: 'cron-deadline-monitor',
    }
  );

  // 2. Delivery Sync: every 15 minutes ('*/15 * * * *')
  await deliverySyncQueue.add(
    'sync-shipments',
    {},
    {
      repeat: {
        pattern: '*/15 * * * *',
      },
      jobId: 'cron-delivery-sync',
    }
  );

  // 3. Analytics Aggregator: daily at 1:00 AM ('0 1 * * *')
  await analyticsQueue.add(
    'daily-analytics',
    {},
    {
      repeat: {
        pattern: '0 1 * * *',
      },
      jobId: 'cron-analytics-daily',
    }
  );

  logger.info('Recurring BullMQ cron jobs registered successfully.');
};

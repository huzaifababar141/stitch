import { Queue, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';
import config from '../config';
import { logger } from '../config/logger';

// Dedicated Redis connection for BullMQ with maxRetriesPerRequest: null
export const queueRedisConnection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

queueRedisConnection.on('error', (err) => {
  logger.error('BullMQ Redis Connection Error:', err);
});

const defaultJobOptions: QueueOptions['defaultJobOptions'] = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2s, 4s, 8s
  },
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 500, // Keep last 500 failed jobs
};

// Define 5 Core Job Queues
export const notificationQueue = new Queue('notification-queue', {
  connection: queueRedisConnection,
  defaultJobOptions,
});

export const orderAssignmentQueue = new Queue('order-assignment-queue', {
  connection: queueRedisConnection,
  defaultJobOptions,
});

export const deliverySyncQueue = new Queue('delivery-sync-queue', {
  connection: queueRedisConnection,
  defaultJobOptions,
});

export const deadlineMonitorQueue = new Queue('deadline-monitor-queue', {
  connection: queueRedisConnection,
  defaultJobOptions,
});

export const analyticsQueue = new Queue('analytics-queue', {
  connection: queueRedisConnection,
  defaultJobOptions,
});

/**
 * Gracefully close all queues and Redis connection
 */
export const closeAllQueues = async () => {
  logger.info('Closing all BullMQ queues...');
  await Promise.all([
    notificationQueue.close(),
    orderAssignmentQueue.close(),
    deliverySyncQueue.close(),
    deadlineMonitorQueue.close(),
    analyticsQueue.close(),
  ]);
  await queueRedisConnection.quit();
  logger.info('All BullMQ queues closed successfully.');
};

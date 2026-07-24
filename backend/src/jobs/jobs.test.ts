import { processOrderAssignment } from './processors/order-assignment.processor';
import { processDeadlineMonitor } from './processors/deadline-monitor.processor';
import { processNotification } from './processors/notification.processor';
import { setupRecurringJobs } from './schedulers';
import { db } from '../config/database';
import { deadlineMonitorQueue, deliverySyncQueue, analyticsQueue, notificationQueue } from './queues';
import { Job } from 'bullmq';

jest.mock('../config/database', () => ({
  db: {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    tailorProfile: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    notification: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(db)),
  },
}));

jest.mock('./queues', () => ({
  queueRedisConnection: { quit: jest.fn() },
  notificationQueue: { add: jest.fn(), close: jest.fn() },
  orderAssignmentQueue: { add: jest.fn(), close: jest.fn() },
  deliverySyncQueue: { add: jest.fn(), close: jest.fn() },
  deadlineMonitorQueue: { add: jest.fn(), close: jest.fn() },
  analyticsQueue: { add: jest.fn(), close: jest.fn() },
}));

describe('BullMQ Jobs & Processors Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processOrderAssignment', () => {
    it('should calculate tailor scores and assign highest-scoring tailor to order', async () => {
      const mockOrder = { id: 'order-100', orderNumber: 'ORD-100', status: 'payment_confirmed' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const mockTailors = [
        {
          id: 't-1',
          userId: 'tailor-1',
          skillLevel: 'junior',
          maxDailyCapacity: 5,
          currentActiveOrders: 4, // high workload
          qualityScore: 3.5,
          user: { id: 'tailor-1', firstName: 'Junior', lastName: 'Tailor' },
        },
        {
          id: 't-2',
          userId: 'tailor-2',
          skillLevel: 'master', // master bonus
          maxDailyCapacity: 5,
          currentActiveOrders: 1, // low workload
          qualityScore: 4.9, // high quality
          user: { id: 'tailor-2', firstName: 'Master', lastName: 'Tailor' },
        },
      ];

      (db.tailorProfile.findMany as jest.Mock).mockResolvedValue(mockTailors);

      const mockJob = {
        data: { orderId: 'order-100' },
      } as Job;

      await processOrderAssignment(mockJob);

      // Verify Master tailor (t-2) was selected and order updated
      expect(db.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-100' },
          data: expect.objectContaining({
            assignedTailorId: 'tailor-2',
            status: 'assigned',
          }),
        })
      );
      expect(notificationQueue.add).toHaveBeenCalled();
    });

    it('should log warning and exit if no tailors are available', async () => {
      const mockOrder = { id: 'order-100', status: 'payment_confirmed' };
      (db.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (db.tailorProfile.findMany as jest.Mock).mockResolvedValue([]);

      const mockJob = { data: { orderId: 'order-100' } } as Job;
      await processOrderAssignment(mockJob);

      expect(db.order.update).not.toHaveBeenCalled();
    });
  });

  describe('processDeadlineMonitor', () => {
    it('should elevate priority level to urgent (2) for orders approaching deadline in <1 hr', async () => {
      const oneHourAhead = new Date(Date.now() + 30 * 60 * 1000); // 30 mins ahead
      const mockUrgentOrders = [
        {
          id: 'order-500',
          orderNumber: 'ORD-500',
          stitchingDeadline: oneHourAhead,
          priorityLevel: 0,
          assignedTailorId: 'tailor-2',
        },
      ];

      (db.order.findMany as jest.Mock).mockResolvedValue(mockUrgentOrders);

      const mockJob = {} as Job;
      await processDeadlineMonitor(mockJob);

      expect(db.order.update).toHaveBeenCalledWith({
        where: { id: 'order-500' },
        data: { priorityLevel: 2 },
      });
      expect(notificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({ userId: 'tailor-2' })
      );
    });
  });

  describe('processNotification', () => {
    it('should create notification record and update status to sent', async () => {
      (db.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif-1',
        channel: 'whatsapp',
        body: 'Test notification',
      });

      const mockJob = {
        data: {
          userId: 'user-1',
          body: 'Test notification',
          channel: 'whatsapp',
        },
      } as Job;

      await processNotification(mockJob);

      expect(db.notification.create).toHaveBeenCalled();
      expect(db.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { status: 'sent' },
      });
    });
  });

  describe('setupRecurringJobs', () => {
    it('should schedule recurring cron jobs for deadline monitor, delivery sync, and analytics', async () => {
      await setupRecurringJobs();

      expect(deadlineMonitorQueue.add).toHaveBeenCalledWith(
        'check-deadlines',
        {},
        expect.objectContaining({ repeat: { pattern: '*/30 * * * *' } })
      );
      expect(deliverySyncQueue.add).toHaveBeenCalledWith(
        'sync-shipments',
        {},
        expect.objectContaining({ repeat: { pattern: '*/15 * * * *' } })
      );
      expect(analyticsQueue.add).toHaveBeenCalledWith(
        'daily-analytics',
        {},
        expect.objectContaining({ repeat: { pattern: '0 1 * * *' } })
      );
    });
  });
});

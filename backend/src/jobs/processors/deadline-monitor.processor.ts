import { Job } from 'bullmq';
import { db } from '../../config/database';
import { logger } from '../../config/logger';
import { notificationQueue } from '../queues';

export const processDeadlineMonitor = async (job: Job) => {
  logger.info('[Job: DeadlineMonitor] Checking approaching stitching deadlines...');

  const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const oneHourFromNow = new Date(Date.now() + 1 * 60 * 60 * 1000);

  // Find active orders in stitching whose deadline is approaching within 3 hours
  const urgentOrders = await db.order.findMany({
    where: {
      status: 'in_stitching',
      deletedAt: null,
      stitchingDeadline: {
        lte: threeHoursFromNow,
      },
    },
    include: {
      assignedTailor: true,
    },
  });

  logger.info(`[Job: DeadlineMonitor] Found ${urgentOrders.length} orders approaching deadline`);

  for (const order of urgentOrders) {
    // If deadline is within 1 hour, elevate priority level to 2 (urgent)
    if (order.stitchingDeadline && order.stitchingDeadline <= oneHourFromNow && order.priorityLevel < 2) {
      await db.order.update({
        where: { id: order.id },
        data: { priorityLevel: 2 },
      });
      logger.warn(`[Job: DeadlineMonitor] Elevated Order #${order.orderNumber} priority to URGENT (level 2)`);
    }

    // Send WhatsApp alert to tailor if assigned
    if (order.assignedTailorId) {
      await notificationQueue.add('send-notification', {
        userId: order.assignedTailorId,
        orderId: order.id,
        channel: 'whatsapp',
        body: `URGENT REMINDER: Order #${order.orderNumber} stitching deadline is approaching in less than 3 hours!`,
      });
    }
  }
};

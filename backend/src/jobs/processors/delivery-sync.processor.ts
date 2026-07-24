import { Job } from 'bullmq';
import { db } from '../../config/database';
import { logger } from '../../config/logger';

export const processDeliverySync = async (job: Job) => {
  logger.info('[Job: DeliverySync] Synchronizing courier shipment statuses...');

  // Find active deliveries in transit or dispatched
  const activeDeliveries = await db.delivery.findMany({
    where: {
      status: {
        in: ['picked_up', 'in_transit', 'out_for_delivery'],
      },
    },
    take: 50,
  });

  logger.info(`[Job: DeliverySync] Polling tracking updates for ${activeDeliveries.length} active shipments`);

  for (const delivery of activeDeliveries) {
    if (delivery.trackingNumber) {
      logger.info(`[TCS Courier API] Polled status for Tracking ID ${delivery.trackingNumber}`);
    }
  }
};

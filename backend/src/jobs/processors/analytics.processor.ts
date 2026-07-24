import { Job } from 'bullmq';
import { db } from '../../config/database';
import { logger } from '../../config/logger';

export const processAnalytics = async (job: Job) => {
  logger.info('[Job: Analytics] Computing daily operational analytics aggregate...');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalOrdersToday, completedToday] = await Promise.all([
    db.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    db.order.count({
      where: { status: 'delivered', updatedAt: { gte: todayStart } },
    }),
  ]);

  logger.info(
    `[Analytics Engine] Daily Summary — Orders Created: ${totalOrdersToday}, Orders Delivered: ${completedToday}`
  );
};

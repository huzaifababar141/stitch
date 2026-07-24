import { Job } from 'bullmq';
import { db } from '../../config/database';
import { logger } from '../../config/logger';

export interface NotificationJobData {
  notificationId?: string;
  userId?: string;
  orderId?: string;
  channel?: 'whatsapp' | 'sms' | 'email' | 'push';
  templateKey?: string;
  body?: string;
}

export const processNotification = async (job: Job<NotificationJobData>) => {
  const { notificationId, userId, orderId, channel, body } = job.data;
  logger.info(`[Job: Notification] Dispatching notification for user ${userId || 'N/A'}`);

  let notificationRecord;

  if (notificationId) {
    notificationRecord = await db.notification.findUnique({
      where: { id: notificationId },
    });
  } else if (userId && body) {
    notificationRecord = await db.notification.create({
      data: {
        userId,
        orderId: orderId ?? null,
        channel: (channel as any) ?? 'whatsapp',
        body,
        status: 'queued',
      },
    });
  }

  if (!notificationRecord) {
    logger.warn(`[Job: Notification] No notification record found to process`);
    return;
  }

  try {
    // Simulated multi-channel delivery dispatcher (Meta WhatsApp Cloud API / Resend Email / Twilio SMS)
    logger.info(`[Notification Service] Sent via ${notificationRecord.channel}: "${notificationRecord.body}"`);

    await db.notification.update({
      where: { id: notificationRecord.id },
      data: {
        status: 'sent',
      },
    });
  } catch (error: any) {
    logger.error(`[Job: Notification] Failed to dispatch notification ${notificationRecord.id}:`, error);

    await db.notification.update({
      where: { id: notificationRecord.id },
      data: {
        status: 'failed',
        metadata: { error: error.message },
      },
    });

    throw error; // Re-throw to trigger BullMQ retry
  }
};

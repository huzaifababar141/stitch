import { prisma } from '../prisma';
import { createClient } from '../supabase/server';
import { NotificationTemplates } from '../notifications/templates';
import { logger } from '../utils/logger';
import { NotificationChannel } from '@prisma/client';

export class NotificationsService {
  /**
   * Queue a notification in the DB and trigger the Edge Function asynchronously
   */
  static async queueNotification(
    userId: string,
    templateKey: keyof typeof NotificationTemplates,
    variables: any,
    orderId?: string
  ) {
    const templateFn = NotificationTemplates[templateKey];
    if (!templateFn) {
      logger.error(`Notification template ${templateKey as string} not found`);
      return;
    }

    const { title, body, channels } = templateFn(variables);

    // Save one notification per channel
    const createdNotifications = await Promise.all(
      channels.map(async (ch) => {
        const channelEnum = (
          ch === 'sms'
            ? 'sms'
            : ch === 'whatsapp'
              ? 'whatsapp'
              : ch === 'email'
                ? 'email'
                : 'in_app'
        ) as NotificationChannel;
        return await prisma.notification.create({
          data: {
            userId,
            orderId,
            channel: channelEnum,
            templateKey: templateKey as string,
            subject: title,
            body: body,
            metadata: variables || {},
            status: 'pending',
          },
        });
      })
    );

    // Asynchronously trigger Edge Function for external delivery (email/whatsapp)
    if (
      channels.some((c) => c === 'email' || c === 'whatsapp' || c === 'sms')
    ) {
      this.triggerEdgeFunction(createdNotifications[0]?.id).catch((err) => {
        logger.error(`Failed to trigger Edge Function for notification`, err);
      });
    }

    return createdNotifications[0];
  }

  private static async triggerEdgeFunction(notificationId?: string) {
    if (!notificationId) return;
    try {
      const supabase = await createClient();
      await supabase.functions.invoke('send-notification', {
        body: { notificationId },
      });
    } catch (err) {
      logger.warn(
        'Edge function send-notification invocation skipped/failed',
        err
      );
    }
  }

  /**
   * Mark specific notifications as read
   */
  static async markAsRead(userId: string, notificationIds: string[]) {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });
  }

  /**
   * Get total unread count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        status: { not: 'read' },
      },
    });
    return count;
  }
}

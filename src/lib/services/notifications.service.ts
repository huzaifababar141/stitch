import { prisma } from '../prisma';
import { createClient } from '../supabase/server';
import { NotificationTemplates } from '../notifications/templates';
import { logger } from '../utils/logger';

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

    // Save to database
    const notification = await prisma.notification.create({
      data: {
        userId,
        orderId,
        type: templateKey as string,
        title,
        message: body,
        channels: channels as any,
        metadata: variables,
        status: 'pending', // Enums match our Prisma schema
      },
    });

    // Asynchronously trigger Edge Function for external delivery (email/whatsapp)
    if (
      channels.some((c) => c === 'email' || c === 'whatsapp' || c === 'sms')
    ) {
      // Fire and forget
      this.triggerEdgeFunction(notification.id).catch((err) => {
        logger.error(
          `Failed to trigger Edge Function for notification ${notification.id}`,
          err
        );
      });
    }

    return notification;
  }

  private static async triggerEdgeFunction(notificationId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.functions.invoke(
      'send-notification',
      {
        body: { notificationId },
      }
    );

    if (error) {
      throw error;
    }
    return data;
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
        isRead: true,
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
        isRead: false,
      },
    });
    return count;
  }
}

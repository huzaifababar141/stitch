import { NotificationsService } from '@/lib/services/notifications.service';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('NotificationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should queue a notification and invoke Edge Function', async () => {
    const mockInvoke = jest
      .fn()
      .mockResolvedValue({ data: { success: true }, error: null });
    (createClient as jest.Mock).mockReturnValue({
      functions: { invoke: mockInvoke },
    });
    (prisma.notification.create as jest.Mock).mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
    });

    await NotificationsService.queueNotification('user-1', 'ORDER_CONFIRMED', {
      orderId: 'O-123',
      customerName: 'John',
    });

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'ORDER_CONFIRMED',
          status: 'pending',
        }),
      })
    );
    expect(mockInvoke).toHaveBeenCalledWith('send-notification', {
      body: { notificationId: 'notif-1' },
    });
  });

  it('should mark notifications as read', async () => {
    (prisma.notification.updateMany as jest.Mock).mockResolvedValue({
      count: 2,
    });

    await NotificationsService.markAsRead('user-1', ['notif-1', 'notif-2']);

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['notif-1', 'notif-2'] },
        userId: 'user-1',
      },
      data: expect.objectContaining({
        isRead: true,
      }),
    });
  });

  it('should return unread count', async () => {
    (prisma.notification.count as jest.Mock).mockResolvedValue(5);

    const count = await NotificationsService.getUnreadCount('user-1');

    expect(count).toBe(5);
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
    });
  });
});

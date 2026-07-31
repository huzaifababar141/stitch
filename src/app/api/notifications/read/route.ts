import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/utils/auth';
import { NotificationsService } from '@/lib/services/notifications.service';
import { validateBody } from '@/lib/utils/validation';
import { z } from 'zod';

const readSchema = z.object({
  notificationIds: z.array(z.string().uuid()),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await validateBody(request, readSchema);

    await NotificationsService.markAsRead(user.id, body.notificationIds);

    return apiSuccess({ message: 'Notifications marked as read' });
  } catch (error) {
    return handleApiError(error);
  }
}

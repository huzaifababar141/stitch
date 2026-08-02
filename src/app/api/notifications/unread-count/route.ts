import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/utils/auth';
import { NotificationsService } from '@/lib/services/notifications.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const count = await NotificationsService.getUnreadCount(user.id);
    return apiSuccess({ count });
  } catch (error) {
    return handleApiError(error);
  }
}

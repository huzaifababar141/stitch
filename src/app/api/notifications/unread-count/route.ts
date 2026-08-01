import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/utils/response'
import { requireAuth } from '@/lib/utils/auth'
import { NotificationsService } from '@/lib/services/notifications.service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const count = await NotificationsService.getUnreadCount(user.id)
    return apiSuccess({ count })
  } catch (error) {
    return handleApiError(error, request)
  }
}

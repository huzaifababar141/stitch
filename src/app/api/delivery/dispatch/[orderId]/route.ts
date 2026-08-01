import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/utils/response'
import { requireAuth, requireRole } from '@/lib/utils/auth'
import { DeliveryService } from '@/lib/services/delivery.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireRole(request, 'admin', 'super_admin')
    const orderId = params.orderId

    const delivery = await DeliveryService.dispatchOrder(orderId, user.id)

    return apiSuccess({ delivery }, 201)
  } catch (error) {
    return handleApiError(error, request)
  }
}

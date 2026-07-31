import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getOrderById } from '@/lib/services/orders.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = params.id

    const order = await getOrderById(orderId, user.id, user.role)

    return apiSuccess(order)
  } catch (error) {
    return handleApiError(error)
  }
}

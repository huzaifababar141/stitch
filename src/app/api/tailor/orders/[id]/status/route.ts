import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { updateWorkStatus } from '@/lib/services/tailor.service'
import { OrderStatus } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tailor = await requireRole(['tailor'])
    const { status } = await request.json()

    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw AppError.badRequest('Valid status is required')
    }

    const updatedOrder = await updateWorkStatus(tailor.id, params.id, status as OrderStatus)
    return apiSuccess(updatedOrder, 200, { message: 'Order status updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

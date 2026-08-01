import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/utils/response'
import { requireAuth, requireRole } from '@/lib/utils/auth'
import { DeliveryService } from '@/lib/services/delivery.service'
import { DeliveryStatus } from '@prisma/client'
import { validateBody } from '@/lib/utils/validation'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus),
  notes: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireRole(request, 'delivery_agent', 'admin', 'super_admin')
    const orderId = params.orderId
    const body = await validateBody(request, statusSchema)

    const delivery = await DeliveryService.updateStatus(
      orderId,
      body.status,
      user.id,
      body.notes
    )

    return apiSuccess({ delivery })
  } catch (error) {
    return handleApiError(error, request)
  }
}

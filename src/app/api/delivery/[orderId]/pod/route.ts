import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/utils/response'
import { requireRole } from '@/lib/utils/auth'
import { DeliveryService } from '@/lib/services/delivery.service'
import { AppError } from '@/lib/utils/errors'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireRole(request, 'delivery_agent', 'admin', 'super_admin')
    const orderId = params.orderId

    const formData = await request.formData()
    const file = formData.get('podImage') as File | null

    if (!file) {
      throw AppError.badRequest('No podImage provided')
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw AppError.badRequest('Image too large. Maximum size is 5MB.')
    }

    if (!file.type.startsWith('image/')) {
      throw AppError.badRequest('Invalid file type. Only images are allowed.')
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const podUrl = await DeliveryService.uploadProofOfDelivery(
      orderId,
      buffer,
      file.name,
      file.type
    )

    return apiSuccess({ podUrl }, 201)
  } catch (error) {
    return handleApiError(error, request)
  }
}

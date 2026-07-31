import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getOrderDetail } from '@/lib/services/tailor.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tailor = await requireRole(['tailor'])
    const order = await getOrderDetail(tailor.id, params.id)
    return apiSuccess(order)
  } catch (error) {
    return handleApiError(error)
  }
}

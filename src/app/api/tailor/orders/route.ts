import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getMyOrders } from '@/lib/services/tailor.service'

export async function GET(request: NextRequest) {
  try {
    const tailor = await requireRole(['tailor'])
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const filters: any = {}
    if (status) filters.status = status

    const orders = await getMyOrders(tailor.id, filters)
    return apiSuccess(orders)
  } catch (error) {
    return handleApiError(error)
  }
}

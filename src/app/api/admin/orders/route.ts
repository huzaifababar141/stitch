import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { listOrders } from '@/lib/services/admin.service'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin'])
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const result = await listOrders({ status, search }, { page, limit })

    return apiSuccess({
      orders: result.orders,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

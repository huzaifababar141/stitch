import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getRevenueByDay } from '@/lib/services/admin.service'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin'])
    const revenue = await getRevenueByDay()
    return apiSuccess(revenue)
  } catch (error) {
    return handleApiError(error)
  }
}

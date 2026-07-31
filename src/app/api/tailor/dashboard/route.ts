import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getMyDashboard } from '@/lib/services/tailor.service'

export async function GET(request: NextRequest) {
  try {
    const tailor = await requireRole(['tailor'])
    const dashboardStats = await getMyDashboard(tailor.id)
    return apiSuccess(dashboardStats)
  } catch (error) {
    return handleApiError(error)
  }
}

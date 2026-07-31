import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getDashboardStats } from '@/lib/services/admin.service'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin'])
    const stats = await getDashboardStats()
    return apiSuccess(stats)
  } catch (error) {
    return handleApiError(error)
  }
}

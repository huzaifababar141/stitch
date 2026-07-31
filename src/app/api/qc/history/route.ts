import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getInspectionHistory } from '@/lib/services/qc.service'

export async function GET(request: NextRequest) {
  try {
    const inspector = await requireRole(['qc_inspector', 'admin', 'super_admin'])
    const history = await getInspectionHistory(inspector.id)
    return apiSuccess(history)
  } catch (error) {
    return handleApiError(error)
  }
}

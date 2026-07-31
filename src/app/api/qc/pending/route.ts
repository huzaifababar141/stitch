import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getPendingInspections } from '@/lib/services/qc.service'

export async function GET(request: NextRequest) {
  try {
    const inspector = await requireRole(['qc_inspector', 'admin', 'super_admin'])
    const pending = await getPendingInspections(inspector.id)
    return apiSuccess(pending)
  } catch (error) {
    return handleApiError(error)
  }
}

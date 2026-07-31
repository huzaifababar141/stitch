import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { getInspectionDetail } from '@/lib/services/qc.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await requireRole(['qc_inspector', 'admin', 'super_admin'])
    const detail = await getInspectionDetail(params.orderId)
    return apiSuccess(detail)
  } catch (error) {
    return handleApiError(error)
  }
}

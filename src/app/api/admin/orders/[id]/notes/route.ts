import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { addAdminNote } from '@/lib/services/admin.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'super_admin'])
    const { note } = await request.json()

    if (!note) throw AppError.badRequest('note is required')

    const order = await addAdminNote(params.id, note)
    return apiSuccess(order, 200, { message: 'Note added successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'super_admin'])
    const { isActive } = await request.json()

    if (isActive === undefined || typeof isActive !== 'boolean') {
      throw AppError.badRequest('isActive boolean is required')
    }

    const tailor = await prisma.user.findUnique({ where: { id: params.id, role: 'tailor' } })
    if (!tailor) throw AppError.notFound('Tailor not found')

    const updatedTailor = await prisma.user.update({
      where: { id: params.id },
      data: { isActive }
    })

    return apiSuccess(updatedTailor, 200, { message: 'Availability toggled successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

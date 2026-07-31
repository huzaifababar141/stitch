import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'super_admin'])
    
    const tailor = await prisma.user.findUnique({
      where: { id: params.id, role: 'tailor' }
    })

    if (!tailor) throw AppError.notFound('Tailor not found')

    return apiSuccess(tailor)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'super_admin'])
    const data = await request.json()

    // Ensure it's a tailor
    const tailor = await prisma.user.findUnique({ where: { id: params.id, role: 'tailor' } })
    if (!tailor) throw AppError.notFound('Tailor not found')

    const updatedTailor = await prisma.user.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        metadata: data.metadata
      }
    })

    return apiSuccess(updatedTailor, 200, { message: 'Tailor updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

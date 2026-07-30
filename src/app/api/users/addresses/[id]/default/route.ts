import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const addressId = params.id

    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id }
    })

    if (!existingAddress) {
      throw AppError.notFound('Address not found')
    }

    if (existingAddress.isDefault) {
      return apiSuccess(existingAddress, 200, { message: 'Address is already default' })
    }

    const updatedAddress = await prisma.$transaction(async (tx) => {
      // Unset previous defaults
      await tx.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })

      // Set this as default
      return await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      })
    })

    return apiSuccess(updatedAddress, 200, { message: 'Default address updated' })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { updateAddressSchema } from '@/lib/validations/users'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const addressId = params.id

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id }
    })

    if (!address) {
      throw AppError.notFound('Address not found')
    }

    return apiSuccess(address)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const addressId = params.id
    const validatedData = await validateBody(request, updateAddressSchema)

    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id }
    })

    if (!existingAddress) {
      throw AppError.notFound('Address not found')
    }

    const updatedAddress = await prisma.$transaction(async (tx) => {
      // Handle default swap if needed
      if (validatedData.isDefault && !existingAddress.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false }
        })
      }

      return await tx.address.update({
        where: { id: addressId },
        data: validatedData
      })
    })

    return apiSuccess(updatedAddress, 200, { message: 'Address updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
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

    await prisma.$transaction(async (tx) => {
      // Actually delete the address since it's a child record (or soft delete if required by schema)
      // Usually addresses can be hard deleted or soft deleted. If no soft delete field exists, hard delete.
      await tx.address.delete({
        where: { id: addressId }
      })

      // If we deleted the default address, make the most recent address default
      if (existingAddress.isDefault) {
        const remainingAddress = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })

        if (remainingAddress) {
          await tx.address.update({
            where: { id: remainingAddress.id },
            data: { isDefault: true }
          })
        }
      }
    })

    return apiSuccess(null, 200, { message: 'Address deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

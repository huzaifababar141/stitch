import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { createAddressSchema } from '@/lib/validations/users'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return apiSuccess(addresses)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const validatedData = await validateBody(request, createAddressSchema)

    const newAddress = await prisma.$transaction(async (tx) => {
      // If this is the new default address, unset previous defaults
      if (validatedData.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false }
        })
      }

      // Check if this is the first address, make it default automatically
      const addressCount = await tx.address.count({
        where: { userId: user.id }
      })

      const isDefault = addressCount === 0 ? true : validatedData.isDefault

      return await tx.address.create({
        data: {
          ...validatedData,
          isDefault,
          userId: user.id
        }
      })
    })

    return apiSuccess(newAddress, 201, { message: 'Address created successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

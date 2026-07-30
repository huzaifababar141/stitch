import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { createMeasurementSchema } from '@/lib/validations/measurements'
import { prisma } from '@/lib/prisma'
import { validateMeasurementsWithAI } from '@/lib/services/ai-validation'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const profiles = await prisma.measurementProfile.findMany({
      where: { 
        userId: user.id,
        deletedAt: null
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return apiSuccess(profiles)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const validatedData = await validateBody(request, createMeasurementSchema)

    const newProfile = await prisma.$transaction(async (tx) => {
      // If this is the new default, unset previous defaults
      if (validatedData.isDefault) {
        await tx.measurementProfile.updateMany({
          where: { userId: user.id, isDefault: true, deletedAt: null },
          data: { isDefault: false }
        })
      }

      // Check if this is the first profile, make it default automatically
      const profileCount = await tx.measurementProfile.count({
        where: { userId: user.id, deletedAt: null }
      })

      const isDefault = profileCount === 0 ? true : validatedData.isDefault

      return await tx.measurementProfile.create({
        data: {
          ...validatedData,
          isDefault,
          userId: user.id
        }
      })
    })

    // Trigger AI validation async (don't block response)
    setTimeout(() => {
      validateMeasurementsWithAI(newProfile.id).catch(console.error)
    }, 0)

    return apiSuccess(newProfile, 201, { message: 'Measurement profile created successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

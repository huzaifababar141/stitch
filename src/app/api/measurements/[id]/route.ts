import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { updateMeasurementSchema } from '@/lib/validations/measurements'
import { prisma } from '@/lib/prisma'
import { validateMeasurementsWithAI } from '@/lib/services/ai-validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const profileId = params.id

    const profile = await prisma.measurementProfile.findFirst({
      where: { id: profileId, userId: user.id, deletedAt: null }
    })

    if (!profile) {
      throw AppError.notFound('Measurement profile not found')
    }

    return apiSuccess(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const profileId = params.id
    const validatedData = await validateBody(request, updateMeasurementSchema)

    // Verify ownership
    const existingProfile = await prisma.measurementProfile.findFirst({
      where: { id: profileId, userId: user.id, deletedAt: null }
    })

    if (!existingProfile) {
      throw AppError.notFound('Measurement profile not found')
    }

    const newProfile = await prisma.$transaction(async (tx) => {
      // Soft delete the old profile to keep it for order history
      await tx.measurementProfile.update({
        where: { id: profileId },
        data: { deletedAt: new Date(), isDefault: false }
      })

      // Handle default swap if the new one is set to default
      let isDefault = existingProfile.isDefault
      if (validatedData.isDefault !== undefined) {
        isDefault = validatedData.isDefault
      }

      if (isDefault) {
        await tx.measurementProfile.updateMany({
          where: { userId: user.id, isDefault: true, deletedAt: null },
          data: { isDefault: false }
        })
      }

      // Create new profile with incremented version
      const { id, createdAt, updatedAt, deletedAt, ...oldData } = existingProfile

      const newRecord = await tx.measurementProfile.create({
        data: {
          ...oldData, // copy old data
          ...validatedData, // overwrite with new data
          isDefault,
          version: existingProfile.version + 1,
          previousVersionId: existingProfile.id,
          // Reset AI validation since it changed
          aiValidationScore: null,
          aiFlags: [],
          aiValidatedAt: null
        }
      })

      return newRecord
    })

    // Trigger AI validation async for the new profile
    setTimeout(() => {
      validateMeasurementsWithAI(newProfile.id).catch(console.error)
    }, 0)

    return apiSuccess(newProfile, 200, { message: 'Measurement profile updated successfully' })
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
    const profileId = params.id

    // Verify ownership
    const existingProfile = await prisma.measurementProfile.findFirst({
      where: { id: profileId, userId: user.id, deletedAt: null }
    })

    if (!existingProfile) {
      throw AppError.notFound('Measurement profile not found')
    }

    await prisma.$transaction(async (tx) => {
      await tx.measurementProfile.update({
        where: { id: profileId },
        data: { deletedAt: new Date(), isDefault: false }
      })

      // If we deleted the default profile, make the most recent profile default
      if (existingProfile.isDefault) {
        const remainingProfile = await tx.measurementProfile.findFirst({
          where: { userId: user.id, deletedAt: null },
          orderBy: { createdAt: 'desc' }
        })

        if (remainingProfile) {
          await tx.measurementProfile.update({
            where: { id: remainingProfile.id },
            data: { isDefault: true }
          })
        }
      }
    })

    return apiSuccess(null, 200, { message: 'Measurement profile deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

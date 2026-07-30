import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { updateProfileSchema } from '@/lib/validations/users'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        addresses: {
          where: { isDefault: true }
        }
      }
    })

    if (!profile) {
      return apiSuccess(null, 404, { message: 'Profile not found' })
    }

    const { passwordHash, ...safeProfile } = profile as any

    return apiSuccess(safeProfile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const validatedData = await validateBody(request, updateProfileSchema)
    
    // Parse date if provided as string
    let parsedData = { ...validatedData }
    if (typeof parsedData.dateOfBirth === 'string') {
      parsedData.dateOfBirth = new Date(parsedData.dateOfBirth) as any
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: parsedData,
    })

    const { passwordHash, ...safeProfile } = updatedProfile as any

    return apiSuccess(safeProfile, 200, { message: 'Profile updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { getAuthUser, getFullUser } from '@/lib/utils/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      throw AppError.unauthorized('Not authenticated')
    }

    const fullUser = await getFullUser(authUser.id)
    if (!fullUser) {
      throw AppError.notFound('User profile not found')
    }

    // Exclude sensitive fields
    const { passwordHash, ...safeUser } = fullUser as any

    return apiSuccess({ user: safeUser })
  } catch (error) {
    return handleApiError(error)
  }
}

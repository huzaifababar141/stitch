import { NextRequest } from 'next/server'
import { requireRole } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { listTailors } from '@/lib/services/admin.service'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/utils/crypto' // Or however we handle it. Wait, Supabase handles auth.

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin'])
    
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const filters: any = {}
    if (isActive !== null) {
      filters.isActive = isActive === 'true'
    }

    const tailors = await listTailors(filters)
    return apiSuccess(tailors)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin'])
    const data = await request.json()

    if (!data.phone || !data.firstName) {
      throw AppError.badRequest('Phone and first name are required')
    }

    // In a real scenario with Supabase Auth, you'd create the user in Supabase Admin Auth first,
    // then insert into public.users. Here we just mock the public table insert.
    const newTailor = await prisma.user.create({
      data: {
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'tailor',
        isActive: true,
        metadata: data.metadata || {}
      }
    })

    return apiSuccess(newTailor, 201, { message: 'Tailor created successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

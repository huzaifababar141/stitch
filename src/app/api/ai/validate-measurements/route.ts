import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/utils/response'
import { requireAuth } from '@/lib/utils/auth'
import { MeasurementValidator } from '@/lib/services/ai/measurement-validator'
import { validateBody } from '@/lib/utils/validation'
import { z } from 'zod'

const inputSchema = z.object({
  rawInput: z.string().min(5).max(1000)
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await validateBody(request, inputSchema)

    const measurements = await MeasurementValidator.validate(body.rawInput, user.id)

    return apiSuccess({ measurements })
  } catch (error) {
    return handleApiError(error, request)
  }
}

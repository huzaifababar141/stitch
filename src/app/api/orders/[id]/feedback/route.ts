import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { submitFeedbackSchema } from '@/lib/validations/orders'
import { submitFeedback } from '@/lib/services/orders.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = params.id
    const feedbackData = await validateBody(request, submitFeedbackSchema)

    const feedback = await submitFeedback(orderId, user.id, feedbackData)

    return apiSuccess(feedback, 201, { message: 'Feedback submitted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

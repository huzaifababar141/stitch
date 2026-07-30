import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError } from '@/lib/utils/errors'
import { validateBody } from '@/lib/utils/validation'
import { z } from 'zod'
import { parseProductLink } from '@/lib/services/link-parser.service'

const parseProductSchema = z.object({
  url: z.string().url('Must be a valid URL')
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { url } = await validateBody(request, parseProductSchema)

    const product = await parseProductLink(url, user.id)

    return apiSuccess(product, 200, { message: 'Product parsed successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

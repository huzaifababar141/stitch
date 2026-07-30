import { NextRequest } from 'next/server'
import { z } from 'zod'
import { validateBody } from '@/lib/utils/validation'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { otpLimiter, checkRateLimit } from '@/lib/utils/rate-limit'
import { generateOTP, hashValue } from '@/lib/utils/crypto'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+92\d{10}$/, 'Phone must be in format +923XXXXXXXXX'),
})

export async function POST(request: NextRequest) {
  try {
    const { phone } = await validateBody(request, sendOtpSchema)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

    // 1. Rate limiting
    await checkRateLimit(`otp_${ip}`, otpLimiter)
    await checkRateLimit(`otp_${phone}`, otpLimiter)

    // 2. Generate OTP
    const otp = generateOTP()
    const codeHash = await hashValue(otp)

    // 3. Store in DB
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    await prisma.otpCode.create({
      data: {
        phone,
        codeHash,
        purpose: 'login',
        expiresAt,
        ipAddress: ip,
        maxAttempts: 5,
      }
    })

    // 4. Send via WhatsApp (Mocked for now)
    logger.info(`[MOCK WHATSAPP] Sending OTP ${otp} to ${phone}`)
    // TODO: Integrate actual WhatsApp Business API here

    return apiSuccess({ expiresIn: 300 }, 200, { message: 'OTP sent successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

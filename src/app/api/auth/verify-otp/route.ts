import { NextRequest } from 'next/server'
import { z } from 'zod'
import { validateBody } from '@/lib/utils/validation'
import { apiSuccess } from '@/lib/utils/response'
import { handleApiError, AppError } from '@/lib/utils/errors'
import { authLimiter, checkRateLimit } from '@/lib/utils/rate-limit'
import { verifyHash } from '@/lib/utils/crypto'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+92\d{10}$/, 'Phone must be in format +923XXXXXXXXX'),
  token: z.string().length(6, 'OTP must be 6 digits'),
})

// Generate a deterministic but secure password for Supabase Auth to handle custom OTPs
function generateInternalPassword(phone: string) {
  const secret = process.env.SUPABASE_JWT_SECRET || 'default-secret-change-me'
  return crypto.createHmac('sha256', secret).update(phone).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { phone, token } = await validateBody(request, verifyOtpSchema)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

    await checkRateLimit(`verify_${ip}`, authLimiter)
    await checkRateLimit(`verify_${phone}`, authLimiter)

    // 1. Find active OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        purpose: 'login',
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpRecord) {
      throw AppError.badRequest('Invalid or expired OTP')
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw AppError.badRequest('Too many attempts. Please request a new OTP.')
    }

    // 2. Verify Hash
    const isValid = await verifyHash(token, otpRecord.codeHash)
    
    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } }
      })
      throw AppError.badRequest('Invalid OTP code')
    }

    // 3. Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true, usedAt: new Date() }
    })

    // 4. Sync with Supabase Auth
    const internalPassword = generateInternalPassword(phone)
    
    // Check if user exists in our DB
    let user = await prisma.user.findUnique({ where: { phone } })
    let authUserId: string

    if (!user) {
      // Create in Supabase Auth first
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        phone,
        password: internalPassword,
        phone_confirm: true,
        user_metadata: { role: 'customer' }
      })
      
      if (authError || !authData.user) {
        throw AppError.internal('Failed to create authentication record')
      }
      
      authUserId = authData.user.id

      // Create in our Prisma DB
      user = await prisma.user.create({
        data: {
          id: authUserId, // Sync IDs
          phone,
          phoneVerified: true,
          role: 'customer',
          firstName: 'New',
          lastName: 'User',
          isActive: true
        }
      })
    } else {
      authUserId = user.id
      
      // Ensure Supabase user exists and password is set (in case of migration or manual deletion)
      const { data: existingAuth } = await supabaseAdmin.auth.admin.getUserById(authUserId)
      if (!existingAuth.user) {
        await supabaseAdmin.auth.admin.createUser({
          phone,
          password: internalPassword,
          phone_confirm: true,
          user_metadata: { role: user.role }
        })
      } else {
        // Just in case password wasn't set or needs update
        await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: internalPassword })
      }
    }

    // 5. Sign in the user using the server client to set the session cookies
    const supabaseServer = createClient()
    const { data: sessionData, error: signInError } = await supabaseServer.auth.signInWithPassword({
      phone,
      password: internalPassword
    })

    if (signInError) {
      throw AppError.unauthorized('Failed to establish session')
    }

    return apiSuccess({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    }, 200, { message: 'Authentication successful' })

  } catch (error) {
    return handleApiError(error)
  }
}

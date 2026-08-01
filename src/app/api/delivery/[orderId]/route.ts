import { NextRequest } from 'next/server'
import { apiSuccess, handleApiError } from '@/lib/utils/response'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/utils/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireAuth(request)
    const orderId = params.orderId

    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        deliveryAgent: {
          select: { id: true, email: true, role: true }
        }
      }
    })

    if (!delivery) {
      throw AppError.notFound('Delivery record not found')
    }

    // Role checks: Customer can only see their own delivery
    if (user.role === 'customer') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true }
      })
      if (!order || order.customerId !== user.id) {
        throw AppError.forbidden('Cannot access this delivery record')
      }
    }

    return apiSuccess({ delivery })
  } catch (error) {
    return handleApiError(error, request)
  }
}

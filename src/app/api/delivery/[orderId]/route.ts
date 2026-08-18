import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/utils/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orderId } = await context.params;

    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        deliveryAgent: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!delivery) {
      throw AppError.notFound('Delivery record not found');
    }

    // Role checks: Customer can only see their own delivery
    const role = user.user_metadata?.role || 'customer';
    if (role === 'customer') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true },
      });
      if (!order || order.customerId !== user.id) {
        throw AppError.forbidden('Cannot access this delivery record');
      }
    }

    return apiSuccess({ delivery });
  } catch (error) {
    return handleApiError(error);
  }
}

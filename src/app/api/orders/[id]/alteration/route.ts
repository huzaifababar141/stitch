import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: orderId } = await context.params;
    const body = await request.json();

    const { items, notes, pickupAddressId, pickupNotes } = body;

    if (!notes || notes.trim().length < 5) {
      throw AppError.badRequest(
        'Please provide detailed alteration instructions (at least 5 characters).'
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    if (order.customerId !== user.id && user.user_metadata?.role !== 'admin') {
      throw AppError.forbidden(
        'You are not authorized to request alteration for this order.'
      );
    }

    const currentMetadata = (order.metadata as Record<string, any>) || {};

    const alterationRecord = {
      requestedAt: new Date().toISOString(),
      status: 'pending_pickup',
      items: items || [],
      notes: notes.trim(),
      pickupAddressId: pickupAddressId || order.deliveryAddressId,
      pickupNotes: pickupNotes || 'Standard doorstep sample pickup',
    };

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'return_requested',
        metadata: {
          ...currentMetadata,
          alterationRequest: alterationRecord,
        },
      },
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        orderId: order.id,
        channel: 'in_app',
        status: 'sent',
        subject: '7-Day Free Alteration Request Received',
        body: `Your alteration request for order #${order.orderNumber || order.id.slice(0, 8)} has been recorded. Our rider will contact you for suit pickup.`,
        metadata: { alteration: alterationRecord },
      },
    });

    return apiSuccess(
      {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        alteration: alterationRecord,
      },
      201,
      {
        message:
          '7-Day Free Alteration request submitted successfully. A courier rider will be dispatched for pickup.',
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

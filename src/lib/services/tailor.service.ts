import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/utils/errors';
import { emitOrderEvent } from '@/lib/services/orders.service';
import { OrderStatus } from '@prisma/client';

export async function getMyDashboard(tailorId: string) {
  const [activeOrders, pendingOrders, completedOrders] = await Promise.all([
    prisma.order.count({
      where: {
        assignedTailorId: tailorId,
        status: 'in_stitching',
        deletedAt: null,
      },
    }),
    prisma.order.count({
      where: {
        assignedTailorId: tailorId,
        status: 'assigned',
        deletedAt: null,
      },
    }),
    prisma.order.count({
      where: {
        assignedTailorId: tailorId,
        status: 'stitching_complete',
        deletedAt: null,
      },
    }),
  ]);

  // Tailor profile quality score
  const profile = await prisma.tailorProfile.findUnique({
    where: { userId: tailorId },
  });
  const qualityScore = profile ? Number(profile.qualityScore) : 4.9;

  return { activeOrders, pendingOrders, completedOrders, qualityScore };
}

export async function getMyOrders(tailorId: string, filters: any = {}) {
  const where: any = { assignedTailorId: tailorId, deletedAt: null };
  if (filters.status) where.status = filters.status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { stitchingDeadline: 'asc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      stitchingDeadline: true,
      garmentType: true,
      measurementSnapshot: true,
      styleSnapshot: true,
      priorityLevel: true,
      createdAt: true,
    },
  });

  return orders;
}

export async function getOrderDetail(tailorId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      measurementProfile: true,
      styleConfig: true,
      product: true,
    },
  });

  if (!order || order.deletedAt) throw AppError.notFound('Order not found');
  if (order.assignedTailorId !== tailorId)
    throw AppError.forbidden('Access denied to this order');

  return order;
}

export async function updateWorkStatus(
  tailorId: string,
  orderId: string,
  newStatus: OrderStatus
) {
  const order = await getOrderDetail(tailorId, orderId);

  // State machine logic
  if (order.status === 'assigned' && newStatus !== 'in_stitching') {
    throw AppError.badRequest('Can only move from assigned to in_stitching');
  }
  if (order.status === 'in_stitching' && newStatus !== 'stitching_complete') {
    throw AppError.badRequest(
      'Can only move from in_stitching to stitching_complete'
    );
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus: newStatus,
      notes: `Status updated to ${newStatus} by tailor`,
      changedById: tailorId,
    },
  });

  await emitOrderEvent(orderId, 'work_status_updated', { status: newStatus });

  // Trigger Supabase Edge Function for notification if stitching complete
  if (
    newStatus === 'stitching_complete' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          userId: order.customerId,
          templateKey: 'ORDER_READY_FOR_QC',
          variables: { orderId: order.orderNumber },
          channel: 'in_app',
        }),
      }
    ).catch(console.error);
  }

  return updatedOrder;
}

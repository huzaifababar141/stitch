import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/utils/errors';
import { emitOrderEvent } from '@/lib/services/orders.service';
import { OrderStatus } from '@prisma/client';

export async function listOrders(
  filters: any = {},
  pagination: any = { page: 1, limit: 20 }
) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 20;
  const skip = (page - 1) * limit;
  const where: any = { deletedAt: null };

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      {
        customer: {
          firstName: { contains: filters.search, mode: 'insensitive' },
        },
      },
      {
        customer: {
          lastName: { contains: filters.search, mode: 'insensitive' },
        },
      },
    ];
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        assignedTailor: {
          select: { id: true, firstName: true, lastName: true },
        },
        qcInspector: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  ]);

  return { total, page, limit, orders };
}

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      assignedTailor: true,
      qcInspector: true,
      measurementProfile: true,
      styleConfig: true,
      deliveryAddress: true,
      delivery: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order) throw AppError.notFound('Order not found');
  return order;
}

export async function assignTailor(
  orderId: string,
  tailorId: string,
  adminId: string
) {
  const order = await getOrder(orderId);

  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor', isActive: true },
  });
  if (!tailor) throw AppError.badRequest('Invalid or inactive tailor');

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      assignedTailorId: tailorId,
      assignedAt: new Date(),
      status: 'in_stitching',
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus: 'in_stitching',
      notes: 'Manually assigned by admin',
      changedById: adminId,
    },
  });

  await emitOrderEvent(orderId, 'assigned', { tailorId });

  // Trigger tailor notification via edge function
  if (
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
          userId: tailorId,
          templateKey: 'ORDER_ASSIGNED',
          variables: { orderId: order.orderNumber },
          channel: 'in_app',
        }),
      }
    ).catch(console.error);
  }

  return updatedOrder;
}

export async function updateOrderPriority(
  orderId: string,
  priorityLevel: number
) {
  return await prisma.order.update({
    where: { id: orderId },
    data: { priorityLevel },
  });
}

export async function addAdminNote(orderId: string, note: string) {
  const order = await getOrder(orderId);
  const existingNotes = order.adminNotes ? order.adminNotes + '\n' : '';

  return await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: existingNotes + note },
  });
}

export async function overrideOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminId: string
) {
  const order = await getOrder(orderId);
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus: status,
      notes: 'Status overridden by Super Admin',
      changedById: adminId,
    },
  });

  await emitOrderEvent(orderId, 'status_override', { status });
  return updatedOrder;
}

export async function listTailors(filters: any = {}) {
  return await prisma.user.findMany({
    where: { role: 'tailor', ...filters },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      metadata: true,
      tailorProfile: true,
    },
  });
}

export async function getDashboardStats() {
  const [totalOrders, activeTailors, pendingQC, inStitching, completedOrders] =
    await Promise.all([
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'tailor', isActive: true } }),
      prisma.order.count({
        where: { status: 'stitching_complete', deletedAt: null },
      }),
      prisma.order.count({
        where: { status: 'in_stitching', deletedAt: null },
      }),
      prisma.order.count({ where: { status: 'delivered', deletedAt: null } }),
    ]);

  const revenueAggregate = await prisma.order.aggregate({
    where: { deletedAt: null, status: { notIn: ['cancelled', 'refunded'] } },
    _sum: { totalAmount: true },
  });

  const totalRevenue = revenueAggregate._sum.totalAmount || 0;

  return {
    totalOrders,
    activeTailors,
    pendingQC,
    inStitching,
    completedOrders,
    totalRevenue,
  };
}

export async function getRevenueByDay() {
  const orders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      status: { notIn: ['cancelled', 'refunded'] },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { createdAt: true, totalAmount: true },
    orderBy: { createdAt: 'asc' },
  });

  const revenueMap: Record<string, number> = {};
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().split('T')[0];
    revenueMap[day] = (revenueMap[day] || 0) + Number(o.totalAmount);
  });

  return Object.entries(revenueMap).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export async function getTailorPerformance() {
  const tailors = await prisma.user.findMany({
    where: { role: 'tailor', isActive: true },
    include: {
      tailorProfile: true,
      ordersAsTailor: {
        where: { deletedAt: null },
        select: { status: true, qcResult: true },
      },
    },
  });

  return tailors.map((t) => {
    const completed = t.ordersAsTailor.filter(
      (o) => o.status === 'delivered' || o.status === 'stitching_complete'
    ).length;
    const active = t.ordersAsTailor.filter(
      (o) => o.status === 'in_stitching' || o.status === 'assigned'
    ).length;
    return {
      tailorId: t.id,
      name: `${t.firstName} ${t.lastName || ''}`.trim(),
      completedOrders: completed,
      activeOrders: active,
      qualityScore: t.tailorProfile
        ? Number(t.tailorProfile.qualityScore)
        : 4.8,
    };
  });
}

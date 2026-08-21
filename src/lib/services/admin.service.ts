import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/utils/errors';
import { emitOrderEvent } from '@/lib/services/orders.service';
import { OrderStatus, Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

interface OrderFilters {
  status?: string | null;
  search?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
}

export async function listOrders(
  filters: OrderFilters,
  pagination: Pagination
) {
  const skip = (pagination.page - 1) * pagination.limit;
  const where: Prisma.OrderWhereInput = { deletedAt: null };

  if (filters.status) {
    if (!Object.values(OrderStatus).includes(filters.status as OrderStatus)) {
      throw AppError.badRequest(`Invalid status filter: ${filters.status}`);
    }
    where.status = filters.status as OrderStatus;
  }

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
      take: pagination.limit,
      orderBy: [{ priorityLevel: 'desc' }, { createdAt: 'desc' }],
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        assignedTailor: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
  ]);

  return { total, orders };
}

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          gender: true,
        },
      },
      assignedTailor: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      qcInspector: { select: { id: true, firstName: true, lastName: true } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      delivery: true,
      coupon: {
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
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

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        assignedTailorId: tailorId,
        assignedAt: new Date(),
        status: 'in_stitching',
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: 'in_stitching',
        changedById: adminId,
        notes: 'Manually assigned by admin',
      },
    }),
    prisma.tailorProfile.updateMany({
      where: { userId: tailorId },
      data: { currentActiveOrders: { increment: 1 } },
    }),
  ]);

  await emitOrderEvent(orderId, 'assigned', { tailorId });

  // Trigger tailor notification via edge function (fire-and-forget)
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

  return updatedOrder;
}

export async function updateOrderPriority(
  orderId: string,
  priorityLevel: number
) {
  await getOrder(orderId);
  return prisma.order.update({
    where: { id: orderId },
    data: { priorityLevel },
  });
}

export async function addAdminNote(orderId: string, note: string) {
  const order = await getOrder(orderId);
  const existingNotes = order.adminNotes ? order.adminNotes + '\n' : '';

  return prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: existingNotes + note },
  });
}

export async function overrideOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminId: string
) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!existing) throw AppError.notFound('Order not found');

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: existing.status,
        toStatus: status,
        changedById: adminId,
        notes: 'Status overridden by Super Admin',
      },
    }),
  ]);

  await emitOrderEvent(orderId, 'status_override', { status });
  return updatedOrder;
}

export async function cancelOrder(
  orderId: string,
  reason: string,
  adminId: string
) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!existing) throw AppError.notFound('Order not found');

  const terminal: OrderStatus[] = [
    'delivered',
    'cancelled',
    'refunded',
    'returned',
  ];
  if (terminal.includes(existing.status)) {
    throw AppError.badRequest(
      `Cannot cancel an order that is already ${existing.status}`
    );
  }

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        cancelledById: adminId,
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: existing.status,
        toStatus: 'cancelled',
        changedById: adminId,
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by admin',
      },
    }),
  ]);

  await emitOrderEvent(orderId, 'cancelled', { reason });
  return updatedOrder;
}

// ---------------------------------------------------------------------------
// Tailors
// ---------------------------------------------------------------------------

interface TailorFilters {
  isActive?: boolean;
  search?: string | null;
}

const tailorProfileSelect = {
  id: true,
  employeeId: true,
  skillLevel: true,
  maxDailyCapacity: true,
  currentActiveOrders: true,
  totalOrdersCompleted: true,
  totalOrdersRejectedQc: true,
  qualityScore: true,
  onTimeRate: true,
  isAvailable: true,
} as const;

function normalizeProfile<
  T extends { qualityScore: Prisma.Decimal; onTimeRate: Prisma.Decimal },
>(profile: T | null) {
  if (!profile) return null;
  return {
    ...profile,
    qualityScore: Number(profile.qualityScore),
    onTimeRate: Number(profile.onTimeRate),
  };
}

export async function listTailors(filters: TailorFilters = {}) {
  const where: Prisma.UserWhereInput = { role: 'tailor' };
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search } },
    ];
  }

  const tailors = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      tailorProfile: { select: tailorProfileSelect },
    },
  });

  return tailors.map((t) => ({
    ...t,
    tailorProfile: normalizeProfile(t.tailorProfile),
  }));
}

export async function getTailor(tailorId: string) {
  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      tailorProfile: { select: tailorProfileSelect },
    },
  });
  if (!tailor) throw AppError.notFound('Tailor not found');
  return { ...tailor, tailorProfile: normalizeProfile(tailor.tailorProfile) };
}

interface CreateTailorInput {
  phone: string;
  firstName: string;
  lastName?: string;
  email?: string;
  skillLevel?: string;
  maxDailyCapacity?: number;
  employeeId?: string;
}

export async function createTailor(input: CreateTailorInput) {
  const existing = await prisma.user.findUnique({
    where: { phone: input.phone },
  });
  if (existing)
    throw AppError.badRequest('A user with this phone already exists');

  const tailor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        role: 'tailor',
        isActive: true,
      },
    });

    await tx.tailorProfile.create({
      data: {
        userId: user.id,
        employeeId: input.employeeId,
        skillLevel:
          (input.skillLevel as Prisma.TailorProfileCreateInput['skillLevel']) ??
          'junior',
        maxDailyCapacity: input.maxDailyCapacity ?? 3,
      },
    });

    return user;
  });

  return getTailor(tailor.id);
}

interface UpdateTailorInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  skillLevel?: string;
  maxDailyCapacity?: number;
  employeeId?: string;
}

export async function updateTailor(tailorId: string, input: UpdateTailorInput) {
  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor' },
  });
  if (!tailor) throw AppError.notFound('Tailor not found');

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tailorId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
      },
    });

    const profileData = {
      skillLevel:
        input.skillLevel as Prisma.TailorProfileUpdateInput['skillLevel'],
      maxDailyCapacity: input.maxDailyCapacity,
      employeeId: input.employeeId,
    };

    await tx.tailorProfile.upsert({
      where: { userId: tailorId },
      update: profileData,
      create: {
        userId: tailorId,
        skillLevel:
          (input.skillLevel as Prisma.TailorProfileCreateInput['skillLevel']) ??
          'junior',
        maxDailyCapacity: input.maxDailyCapacity ?? 3,
        employeeId: input.employeeId,
      },
    });
  });

  return getTailor(tailorId);
}

export async function setTailorAvailability(
  tailorId: string,
  isAvailable: boolean
) {
  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor' },
  });
  if (!tailor) throw AppError.notFound('Tailor not found');

  await prisma.tailorProfile.upsert({
    where: { userId: tailorId },
    update: { isAvailable },
    create: { userId: tailorId, isAvailable },
  });

  return getTailor(tailorId);
}

// ---------------------------------------------------------------------------
// Dashboard & analytics
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  const [totalOrders, activeTailors, pendingQC, totalCustomers, revenueAgg] =
    await Promise.all([
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'tailor', isActive: true } }),
      prisma.order.count({
        where: { status: { in: ['stitching_complete', 'qc_pending'] } },
      }),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'delivered' },
      }),
    ]);

  return {
    totalOrders,
    activeTailors,
    pendingQC,
    totalCustomers,
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
  };
}

export async function getRevenueByDay() {
  const rows = await prisma.$queryRaw<
    Array<{ date: Date | string; revenue: number }>
  >`
    SELECT date_trunc('day', created_at)::date AS date,
           COALESCE(SUM(total_amount), 0)::float8 AS revenue
    FROM orders
    WHERE deleted_at IS NULL
      AND status NOT IN ('pending_payment', 'cancelled', 'refunded')
      AND created_at >= (CURRENT_DATE - INTERVAL '13 days')
    GROUP BY 1
    ORDER BY 1
  `;

  const toKey = (d: Date | string) =>
    (typeof d === 'string' ? new Date(d) : d).toISOString().slice(0, 10);
  const map = new Map(rows.map((r) => [toKey(r.date), Number(r.revenue)]));

  // Fill the 14-day window so the chart has no gaps.
  const result: Array<{ date: string; revenue: number }> = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, revenue: map.get(key) ?? 0 });
  }
  return result;
}

export async function getOrdersByStatus() {
  const grouped = await prisma.order.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: { deletedAt: null },
  });
  return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}

export async function getTailorPerformance() {
  const profiles = await prisma.tailorProfile.findMany({
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, isActive: true },
      },
    },
    orderBy: { totalOrdersCompleted: 'desc' },
  });

  return profiles.map((p) => ({
    tailorId: p.userId,
    name: `${p.user.firstName}${p.user.lastName ? ' ' + p.user.lastName : ''}`,
    skillLevel: p.skillLevel,
    isActive: p.user.isActive,
    isAvailable: p.isAvailable,
    currentActiveOrders: p.currentActiveOrders,
    completedOrders: p.totalOrdersCompleted,
    rejectedQc: p.totalOrdersRejectedQc,
    qualityScore: Number(p.qualityScore),
    onTimeRate: Number(p.onTimeRate),
    avgCompletionHours:
      p.avgCompletionHours != null ? Number(p.avgCompletionHours) : null,
  }));
}

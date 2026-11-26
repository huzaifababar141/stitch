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
  unitId?: string | null; // 'unassigned' or UUID
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

  if (filters.unitId === 'unassigned') {
    where.assignedUnitId = null;
  } else if (filters.unitId) {
    where.assignedUnitId = filters.unitId;
  }

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
        assignedUnit: {
          select: {
            id: true,
            name: true,
            location: true,
            city: true,
            manager: { select: { firstName: true, lastName: true } },
          },
        },
        assignedTailor: {
          select: { id: true, firstName: true, lastName: true },
        },
        product: {
          select: { id: true, name: true, unitId: true },
        },
      },
    }),
  ]);

  return { total, orders };
}

export async function getOrder(orderId: string, scopedUnitId?: string | null) {
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
      assignedUnit: {
        select: {
          id: true,
          name: true,
          location: true,
          city: true,
          maxDailyCapacity: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      },
      assignedTailor: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          unitId: true,
          unit: { select: { id: true, name: true } },
        },
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
  if (scopedUnitId && order.assignedUnitId !== scopedUnitId) {
    throw AppError.forbidden(
      'This order is not assigned to your tailoring unit.'
    );
  }
  return order;
}

export async function assignOrderToUnit(
  orderId: string,
  unitId: string,
  superAdminId: string,
  reason?: string
) {
  const order = await getOrder(orderId);

  const unit = await prisma.tailoringUnit.findFirst({
    where: { id: unitId, isActive: true },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!unit) {
    throw AppError.badRequest(
      'Selected tailoring unit does not exist or is inactive.'
    );
  }

  const switchingUnit = order.assignedUnitId && order.assignedUnitId !== unitId;
  const previousTailorId = switchingUnit ? order.assignedTailorId : null;

  const nextStatus: OrderStatus =
    order.status === 'pending_payment' || order.status === 'payment_confirmed'
      ? 'assigned'
      : order.status;

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (previousTailorId) {
      await tx.tailorProfile.updateMany({
        where: { userId: previousTailorId, currentActiveOrders: { gt: 0 } },
        data: { currentActiveOrders: { decrement: 1 } },
      });
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        assignedUnitId: unit.id,
        assignedUnitAt: new Date(),
        ...(switchingUnit ? { assignedTailorId: null, assignedAt: null } : {}),
        assignmentReason:
          reason?.trim() || `Assigned to unit: ${unit.name} (${unit.location})`,
        status: nextStatus,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: nextStatus,
        changedById: superAdminId,
        notes:
          `Assigned to unit: ${unit.name} (${unit.location}) — Manager: ${unit.manager.firstName} ${unit.manager.lastName || ''}`.trim(),
      },
    });

    return updated;
  });

  await emitOrderEvent(orderId, 'unit_assigned', { unitId: unit.id });
  return updatedOrder;
}

export async function assignTailor(
  orderId: string,
  tailorId: string,
  adminId: string,
  scopedUnitId?: string | null
) {
  const order = await getOrder(orderId, scopedUnitId);

  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor', isActive: true },
    include: { tailorProfile: true },
  });
  if (!tailor) throw AppError.badRequest('Invalid or inactive tailor');

  if (scopedUnitId && tailor.tailorProfile?.unitId !== scopedUnitId) {
    throw AppError.forbidden(
      'You can only assign orders to tailors belonging to your own unit.'
    );
  }

  const previousTailorId =
    order.assignedTailorId && order.assignedTailorId !== tailorId
      ? order.assignedTailorId
      : null;

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        assignedTailorId: tailorId,
        assignedAt: new Date(),
        // Ensure order is linked to the tailor's unit if not already assigned
        ...(!order.assignedUnitId && tailor.tailorProfile?.unitId
          ? {
              assignedUnitId: tailor.tailorProfile.unitId,
              assignedUnitAt: new Date(),
            }
          : {}),
        status: 'in_stitching',
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: 'in_stitching',
        changedById: adminId,
        notes:
          `Assigned to tailor: ${tailor.firstName} ${tailor.lastName || ''}`.trim(),
      },
    }),
    ...(previousTailorId
      ? [
          prisma.tailorProfile.updateMany({
            where: { userId: previousTailorId, currentActiveOrders: { gt: 0 } },
            data: { currentActiveOrders: { decrement: 1 } },
          }),
        ]
      : []),
    ...(order.assignedTailorId !== tailorId
      ? [
          prisma.tailorProfile.updateMany({
            where: { userId: tailorId },
            data: { currentActiveOrders: { increment: 1 } },
          }),
        ]
      : []),
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
  priorityLevel: number,
  scopedUnitId?: string | null
) {
  await getOrder(orderId, scopedUnitId);
  return prisma.order.update({
    where: { id: orderId },
    data: { priorityLevel },
  });
}

export async function addAdminNote(
  orderId: string,
  note: string,
  scopedUnitId?: string | null
) {
  const order = await getOrder(orderId, scopedUnitId);
  const existingNotes = order.adminNotes ? order.adminNotes + '\n' : '';

  return prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: existingNotes + note },
  });
}

const UNIT_ALLOWED_STATUSES = new Set<OrderStatus>([
  'in_stitching',
  'stitching_complete',
  'qc_pending',
]);

export async function overrideOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminId: string,
  options?: { scopedUnitId?: string | null; isSuperAdmin?: boolean }
) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, assignedUnitId: true, assignedTailorId: true },
  });
  if (!existing) throw AppError.notFound('Order not found');

  if (!options?.isSuperAdmin) {
    if (
      !options?.scopedUnitId ||
      existing.assignedUnitId !== options.scopedUnitId
    ) {
      throw AppError.forbidden('This order is not assigned to your unit.');
    }
    if (!UNIT_ALLOWED_STATUSES.has(status)) {
      throw AppError.forbidden(
        'Unit managers can only update stitching progress (In Stitching, Stitching Complete, QC Pending).'
      );
    }
  }

  const completedNow =
    (status === 'stitching_complete' ||
      status === 'qc_pending' ||
      status === 'delivered') &&
    existing.status === 'in_stitching' &&
    existing.assignedTailorId;

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
        notes: options?.isSuperAdmin
          ? 'Status overridden by Super Admin'
          : 'Stitching status updated by Unit Manager',
      },
    }),
    ...(completedNow
      ? [
          prisma.tailorProfile.updateMany({
            where: {
              userId: existing.assignedTailorId!,
              currentActiveOrders: { gt: 0 },
            },
            data: {
              currentActiveOrders: { decrement: 1 },
              totalOrdersCompleted: { increment: 1 },
            },
          }),
        ]
      : []),
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
  unitId?: string | null;
}

const tailorProfileSelect = {
  id: true,
  unitId: true,
  unit: {
    select: {
      id: true,
      name: true,
      location: true,
      city: true,
    },
  },
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
  if (filters.unitId === 'unassigned') {
    where.tailorProfile = { is: { unitId: null } };
  } else if (filters.unitId) {
    where.tailorProfile = { is: { unitId: filters.unitId } };
  }
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
      ordersAsTailor: {
        where: {
          deletedAt: null,
          status: {
            in: [
              'assigned',
              'in_stitching',
              'stitching_complete',
              'qc_pending',
              'qc_rejected',
            ],
          },
        },
        orderBy: { assignedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          garmentType: true,
          status: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  return tailors.map((t) => ({
    ...t,
    tailorProfile: normalizeProfile(t.tailorProfile),
  }));
}

export async function getTailor(
  tailorId: string,
  scopedUnitId?: string | null
) {
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
      ordersAsTailor: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          garmentType: true,
          status: true,
          assignedAt: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
  if (!tailor) throw AppError.notFound('Tailor not found');
  if (scopedUnitId && tailor.tailorProfile?.unitId !== scopedUnitId) {
    throw AppError.forbidden('This tailor does not belong to your unit.');
  }
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
  unitId?: string | null;
}

export async function createTailor(
  input: CreateTailorInput,
  scopedUnitId?: string | null
) {
  const existing = await prisma.user.findUnique({
    where: { phone: input.phone },
  });
  if (existing)
    throw AppError.badRequest('A user with this phone already exists');

  const resolvedUnitId = scopedUnitId ?? input.unitId ?? null;

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
        unitId: resolvedUnitId,
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
  unitId?: string | null;
}

export async function updateTailor(
  tailorId: string,
  input: UpdateTailorInput,
  scopedUnitId?: string | null
) {
  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor' },
    include: { tailorProfile: true },
  });
  if (!tailor) throw AppError.notFound('Tailor not found');
  if (scopedUnitId && tailor.tailorProfile?.unitId !== scopedUnitId) {
    throw AppError.forbidden('You can only edit tailors in your own unit.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tailorId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
      },
    });

    const profileData: Prisma.TailorProfileUpdateInput = {
      skillLevel:
        input.skillLevel as Prisma.TailorProfileUpdateInput['skillLevel'],
      maxDailyCapacity: input.maxDailyCapacity,
      employeeId: input.employeeId,
      // Only Super Admin (no scopedUnitId) can reassign a tailor to another unit
      ...(!scopedUnitId && input.unitId !== undefined
        ? {
            unit: input.unitId
              ? { connect: { id: input.unitId } }
              : { disconnect: true },
          }
        : {}),
    };

    await tx.tailorProfile.upsert({
      where: { userId: tailorId },
      update: profileData,
      create: {
        userId: tailorId,
        unitId: scopedUnitId ?? input.unitId ?? null,
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
  isAvailable: boolean,
  scopedUnitId?: string | null
) {
  const tailor = await prisma.user.findFirst({
    where: { id: tailorId, role: 'tailor' },
    include: { tailorProfile: true },
  });
  if (!tailor) throw AppError.notFound('Tailor not found');
  if (scopedUnitId && tailor.tailorProfile?.unitId !== scopedUnitId) {
    throw AppError.forbidden('You can only update tailors in your own unit.');
  }

  await prisma.tailorProfile.upsert({
    where: { userId: tailorId },
    update: { isAvailable },
    create: { userId: tailorId, unitId: scopedUnitId ?? null, isAvailable },
  });

  return getTailor(tailorId);
}

// ---------------------------------------------------------------------------
// Dashboard & analytics
// ---------------------------------------------------------------------------

export async function getDashboardStats(scopedUnitId?: string | null) {
  if (scopedUnitId) {
    const [
      totalOrders,
      awaitingTailor,
      inStitching,
      activeTailors,
      completedOrders,
      pendingStock,
    ] = await Promise.all([
      prisma.order.count({
        where: { deletedAt: null, assignedUnitId: scopedUnitId },
      }),
      prisma.order.count({
        where: {
          deletedAt: null,
          assignedUnitId: scopedUnitId,
          assignedTailorId: null,
          status: { notIn: ['cancelled', 'refunded', 'delivered', 'returned'] },
        },
      }),
      prisma.order.count({
        where: {
          deletedAt: null,
          assignedUnitId: scopedUnitId,
          status: 'in_stitching',
        },
      }),
      prisma.user.count({
        where: {
          role: 'tailor',
          isActive: true,
          tailorProfile: { is: { unitId: scopedUnitId } },
        },
      }),
      prisma.order.count({
        where: {
          deletedAt: null,
          assignedUnitId: scopedUnitId,
          status: {
            in: [
              'stitching_complete',
              'qc_pending',
              'qc_approved',
              'dispatched',
              'delivered',
            ],
          },
        },
      }),
      prisma.product.count({
        where: {
          parseSource: 'in_house',
          unitId: scopedUnitId,
          approvalStatus: 'pending',
        },
      }),
    ]);

    return {
      scope: 'unit' as const,
      totalOrders,
      activeTailors,
      pendingQC: awaitingTailor,
      totalCustomers: inStitching,
      totalRevenue: completedOrders,
      awaitingTailor,
      inStitching,
      completedOrders,
      pendingStockApprovals: pendingStock,
      totalUnits: 1,
      unassignedOrders: awaitingTailor,
    };
  }

  const [
    totalOrders,
    activeTailors,
    pendingQC,
    totalCustomers,
    revenueAgg,
    totalUnits,
    unassignedOrders,
    pendingStockApprovals,
  ] = await Promise.all([
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
    prisma.tailoringUnit.count({ where: { isActive: true } }),
    prisma.order.count({
      where: {
        deletedAt: null,
        assignedUnitId: null,
        status: { notIn: ['cancelled', 'refunded', 'delivered', 'returned'] },
      },
    }),
    prisma.product.count({
      where: { parseSource: 'in_house', approvalStatus: 'pending' },
    }),
  ]);

  return {
    scope: 'hq' as const,
    totalOrders,
    activeTailors,
    pendingQC,
    totalCustomers,
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    totalUnits,
    unassignedOrders,
    pendingStockApprovals,
  };
}

export async function getRevenueByDay(scopedUnitId?: string | null) {
  const rows = scopedUnitId
    ? await prisma.$queryRaw<Array<{ date: Date | string; revenue: number }>>`
        SELECT date_trunc('day', created_at)::date AS date,
               COALESCE(SUM(total_amount), 0)::float8 AS revenue
        FROM orders
        WHERE deleted_at IS NULL
          AND assigned_unit_id = ${scopedUnitId}::uuid
          AND status NOT IN ('pending_payment', 'cancelled', 'refunded')
          AND created_at >= (CURRENT_DATE - INTERVAL '13 days')
        GROUP BY 1
        ORDER BY 1
      `
    : await prisma.$queryRaw<Array<{ date: Date | string; revenue: number }>>`
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

export async function getOrdersByStatus(scopedUnitId?: string | null) {
  const grouped = await prisma.order.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: {
      deletedAt: null,
      ...(scopedUnitId ? { assignedUnitId: scopedUnitId } : {}),
    },
  });
  return grouped.map((g) => ({ status: g.status, count: g._count._all }));
}

export async function getTailorPerformance(scopedUnitId?: string | null) {
  const profiles = await prisma.tailorProfile.findMany({
    where: scopedUnitId ? { unitId: scopedUnitId } : undefined,
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

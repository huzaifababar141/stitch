import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AppError } from '@/lib/utils/errors';
import type { CreateUnitInput, UpdateUnitInput } from '@/lib/validations/unit';

const ACTIVE_ORDER_STATUSES = [
  'pending_payment',
  'payment_confirmed',
  'assigned',
  'in_stitching',
  'stitching_complete',
  'qc_pending',
  'qc_rejected',
] as const;

export async function listUnits() {
  const units = await prisma.tailoringUnit.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
      tailors: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
            },
          },
        },
      },
      _count: {
        select: {
          tailors: true,
          orders: true,
          products: true,
        },
      },
    },
  });

  // Compute active orders and pending stock counts per unit in 2 lightweight queries
  const [activeOrdersGrouped, pendingStockGrouped] = await Promise.all([
    prisma.order.groupBy({
      by: ['assignedUnitId'],
      where: {
        deletedAt: null,
        assignedUnitId: { not: null },
        status: { in: [...ACTIVE_ORDER_STATUSES] },
      },
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ['unitId'],
      where: {
        parseSource: 'in_house',
        unitId: { not: null },
        approvalStatus: 'pending',
      },
      _count: { _all: true },
    }),
  ]);

  const activeOrderMap = new Map(
    activeOrdersGrouped.map((r) => [r.assignedUnitId!, r._count._all])
  );
  const pendingStockMap = new Map(
    pendingStockGrouped.map((r) => [r.unitId!, r._count._all])
  );

  return units.map((u) => {
    const activeTailors = u.tailors.filter((t) => t.user.isActive);
    const tailorsDailyCapacity = activeTailors.reduce(
      (sum, t) => sum + t.maxDailyCapacity,
      0
    );

    return {
      id: u.id,
      name: u.name,
      location: u.location,
      city: u.city,
      maxDailyCapacity: u.maxDailyCapacity,
      tailorsDailyCapacity,
      hasStockAccess: u.hasStockAccess,
      isActive: u.isActive,
      notes: u.notes,
      createdAt: u.createdAt,
      manager: u.manager,
      tailorCount: activeTailors.length,
      totalTailorCount: u._count.tailors,
      totalOrdersCount: u._count.orders,
      activeOrdersCount: activeOrderMap.get(u.id) ?? 0,
      productsCount: u._count.products,
      pendingStockCount: pendingStockMap.get(u.id) ?? 0,
      tailors: activeTailors.map((t) => ({
        id: t.user.id,
        firstName: t.user.firstName,
        lastName: t.user.lastName,
        phone: t.user.phone,
        skillLevel: t.skillLevel,
        currentActiveOrders: t.currentActiveOrders,
        maxDailyCapacity: t.maxDailyCapacity,
        isAvailable: t.isAvailable,
      })),
    };
  });
}

export async function getUnit(unitId: string) {
  const unit = await prisma.tailoringUnit.findUnique({
    where: { id: unitId },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
        },
      },
      tailors: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
            },
          },
        },
      },
      orders: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          garmentType: true,
          totalAmount: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
          assignedTailor: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!unit) throw AppError.notFound('Tailoring unit not found');
  return unit;
}

export async function createUnit(input: CreateUnitInput) {
  const email = input.managerEmail.trim().toLowerCase();

  // Guard against duplicate email/phone in public.users before hitting Supabase Auth
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone: input.managerPhone }],
    },
    select: { id: true, email: true, phone: true },
  });

  if (existingUser) {
    if (existingUser.email?.toLowerCase() === email) {
      throw AppError.badRequest(
        'An account with this manager email already exists.'
      );
    }
    throw AppError.badRequest(
      'An account with this manager phone number already exists.'
    );
  }

  // 1. Create Supabase Auth user with authoritative app_metadata.role = 'admin'
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: input.managerPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' },
      user_metadata: {
        role: 'admin',
        first_name: input.managerFirstName.trim(),
        last_name: input.managerLastName?.trim() || '',
      },
    });

  if (authError || !authData.user) {
    throw AppError.badRequest(
      authError?.message || 'Failed to create Unit Admin login account.'
    );
  }

  const authUserId = authData.user.id;

  try {
    // 2. Create public.users + TailoringUnit atomically in PostgreSQL
    const unit = await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: authUserId },
        update: {
          email,
          phone: input.managerPhone,
          role: 'admin',
          firstName: input.managerFirstName.trim(),
          lastName: input.managerLastName?.trim() || null,
          emailVerified: true,
          isActive: true,
        },
        create: {
          id: authUserId,
          email,
          phone: input.managerPhone,
          role: 'admin',
          firstName: input.managerFirstName.trim(),
          lastName: input.managerLastName?.trim() || null,
          emailVerified: true,
          isActive: true,
        },
      });

      return tx.tailoringUnit.create({
        data: {
          name: input.name.trim(),
          location: input.location.trim(),
          city: input.city.trim(),
          managerId: authUserId,
          maxDailyCapacity: input.maxDailyCapacity,
          hasStockAccess: input.hasStockAccess,
          notes: input.notes?.trim() || null,
          isActive: true,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });
    });

    return unit;
  } catch (err) {
    // Roll back Supabase Auth user if DB transaction fails
    await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(console.error);
    throw err;
  }
}

export async function updateUnit(unitId: string, input: UpdateUnitInput) {
  const existing = await prisma.tailoringUnit.findUnique({
    where: { id: unitId },
    select: { id: true, managerId: true },
  });
  if (!existing) throw AppError.notFound('Tailoring unit not found');

  return prisma.$transaction(async (tx) => {
    if (
      input.managerFirstName !== undefined ||
      input.managerLastName !== undefined ||
      input.managerPhone !== undefined ||
      input.isActive !== undefined
    ) {
      await tx.user.update({
        where: { id: existing.managerId },
        data: {
          ...(input.managerFirstName !== undefined
            ? { firstName: input.managerFirstName.trim() }
            : {}),
          ...(input.managerLastName !== undefined
            ? { lastName: input.managerLastName.trim() || null }
            : {}),
          ...(input.managerPhone !== undefined
            ? { phone: input.managerPhone }
            : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });
    }

    return tx.tailoringUnit.update({
      where: { id: unitId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.location !== undefined
          ? { location: input.location.trim() }
          : {}),
        ...(input.city !== undefined ? { city: input.city.trim() } : {}),
        ...(input.maxDailyCapacity !== undefined
          ? { maxDailyCapacity: input.maxDailyCapacity }
          : {}),
        ...(input.hasStockAccess !== undefined
          ? { hasStockAccess: input.hasStockAccess }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.notes !== undefined
          ? { notes: input.notes ? input.notes.trim() : null }
          : {}),
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
      },
    });
  });
}

export async function deleteUnit(unitId: string) {
  const existing = await prisma.tailoringUnit.findUnique({
    where: { id: unitId },
    include: {
      _count: { select: { orders: true, tailors: true, products: true } },
    },
  });
  if (!existing) throw AppError.notFound('Tailoring unit not found');

  if (existing._count.orders > 0 || existing._count.products > 0) {
    // Deactivate instead of destroying historical order/product links
    await prisma.$transaction([
      prisma.tailoringUnit.update({
        where: { id: unitId },
        data: { isActive: false, hasStockAccess: false },
      }),
      prisma.user.update({
        where: { id: existing.managerId },
        data: { isActive: false },
      }),
    ]);
    return {
      deactivated: true,
      message:
        'Unit deactivated because it has linked orders or stock records.',
    };
  }

  await prisma.tailoringUnit.delete({ where: { id: unitId } });
  await prisma.user
    .update({
      where: { id: existing.managerId },
      data: { isActive: false },
    })
    .catch(() => {});

  return {
    deactivated: false,
    message: 'Tailoring unit removed successfully.',
  };
}

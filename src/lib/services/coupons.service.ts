import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/utils/errors';
import { Prisma } from '@prisma/client';
import { CreateCouponInput, UpdateCouponInput } from '@/lib/validations/coupon';

function normalizeCoupon<
  T extends {
    discountValue: Prisma.Decimal;
    minOrderAmount: Prisma.Decimal;
    maxDiscountAmount: Prisma.Decimal | null;
  },
>(c: T) {
  return {
    ...c,
    discountValue: Number(c.discountValue),
    minOrderAmount: Number(c.minOrderAmount),
    maxDiscountAmount:
      c.maxDiscountAmount != null ? Number(c.maxDiscountAmount) : null,
  };
}

interface CouponFilters {
  isActive?: boolean;
  search?: string | null;
}

export async function listCoupons(filters: CouponFilters = {}) {
  const where: Prisma.CouponWhereInput = {};
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.search)
    where.code = { contains: filters.search, mode: 'insensitive' };

  const coupons = await prisma.coupon.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return coupons.map(normalizeCoupon);
}

export async function createCoupon(input: CreateCouponInput, adminId: string) {
  const existing = await prisma.coupon.findUnique({
    where: { code: input.code },
  });
  if (existing)
    throw AppError.conflict('A coupon with this code already exists');

  const coupon = await prisma.coupon.create({
    data: {
      code: input.code,
      description: input.description,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount ?? 0,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
      usageLimit: input.usageLimit ?? null,
      perUserLimit: input.perUserLimit ?? 1,
      validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      isActive: input.isActive ?? true,
      createdById: adminId,
    },
  });

  return normalizeCoupon(coupon);
}

export async function updateCoupon(couponId: string, input: UpdateCouponInput) {
  const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!existing) throw AppError.notFound('Coupon not found');

  const data: Prisma.CouponUpdateInput = {};
  if (input.description !== undefined) data.description = input.description;
  if (input.discountType !== undefined) data.discountType = input.discountType;
  if (input.discountValue !== undefined)
    data.discountValue = input.discountValue;
  if (input.minOrderAmount !== undefined)
    data.minOrderAmount = input.minOrderAmount;
  if (input.maxDiscountAmount !== undefined)
    data.maxDiscountAmount = input.maxDiscountAmount;
  if (input.usageLimit !== undefined) data.usageLimit = input.usageLimit;
  if (input.perUserLimit !== undefined) data.perUserLimit = input.perUserLimit;
  if (input.validFrom !== undefined) {
    data.validFrom = input.validFrom ? new Date(input.validFrom) : undefined;
  }
  if (input.validUntil !== undefined) {
    data.validUntil = input.validUntil ? new Date(input.validUntil) : null;
  }
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const coupon = await prisma.coupon.update({ where: { id: couponId }, data });
  return normalizeCoupon(coupon);
}

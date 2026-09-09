import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const code = (body.code || '').trim().toUpperCase();
    const stitchingFee = Number(body.stitchingFee || 2000);

    if (!code) {
      throw AppError.badRequest('Coupon or referral code is required');
    }

    // 1. Check if it is a standard promotional Coupon in database
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    const now = new Date();

    if (coupon && coupon.isActive) {
      const isValidDate = !coupon.validUntil || now < coupon.validUntil;
      const isUnderLimit =
        !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

      if (!isValidDate) {
        throw AppError.badRequest('This promo coupon has expired');
      }

      if (!isUnderLimit) {
        throw AppError.badRequest(
          'This coupon has reached its maximum usage limit'
        );
      }

      // Check per-user limit
      const userUsageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: user.id },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        throw AppError.badRequest('You have already used this promo code');
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (stitchingFee * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(
            discountAmount,
            Number(coupon.maxDiscountAmount)
          );
        }
      } else {
        discountAmount = Number(coupon.discountValue);
      }

      discountAmount = Math.min(discountAmount, stitchingFee);

      return apiSuccess({
        valid: true,
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        couponId: coupon.id,
        isReferral: false,
        message: `Promo code "${coupon.code}" applied successfully! (-PKR ${discountAmount.toLocaleString()})`,
      });
    }

    // 2. Check if code is a friend's Referral Code (e.g. TLK-XXXXXX)
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, firstName: true, referralCode: true },
    });

    if (referrer) {
      if (referrer.id === user.id) {
        throw AppError.badRequest('You cannot use your own referral code');
      }

      // Check if user has already placed an order with a referral code
      const priorReferral = await prisma.referral.findFirst({
        where: { refereeId: user.id },
      });

      if (priorReferral) {
        throw AppError.badRequest(
          'You have already redeemed a referral discount on a prior order'
        );
      }

      const referralDiscount = 500;

      return apiSuccess({
        valid: true,
        code: referrer.referralCode,
        discountAmount: referralDiscount,
        discountType: 'fixed_amount',
        couponId: null,
        isReferral: true,
        referrerId: referrer.id,
        message: `Friend referral from ${referrer.firstName} applied! (-PKR ${referralDiscount} off first order)`,
      });
    }

    // 3. Fallback for builtin promo codes if not seeded in db yet
    if (code === 'FIRST500') {
      return apiSuccess({
        valid: true,
        code: 'FIRST500',
        discountAmount: 500,
        discountType: 'fixed_amount',
        couponId: null,
        isReferral: false,
        message: 'Welcome voucher applied: PKR 500 discount!',
      });
    }

    if (code === 'STITCH10') {
      const disc = Math.round(stitchingFee * 0.1);
      return apiSuccess({
        valid: true,
        code: 'STITCH10',
        discountAmount: disc,
        discountType: 'percentage',
        couponId: null,
        isReferral: false,
        message: `10% stitching discount (-PKR ${disc}) applied!`,
      });
    }

    throw AppError.badRequest(
      'Invalid promo or referral code. Please check and try again.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

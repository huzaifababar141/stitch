import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { createCouponSchema } from '@/lib/validations/coupon';
import { listCoupons, createCoupon } from '@/lib/services/coupons.service';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin']);

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const coupons = await listCoupons({
      isActive: isActive === null ? undefined : isActive === 'true',
      search,
    });
    return apiSuccess(coupons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(['admin', 'super_admin']);
    const data = await validateBody(request, createCouponSchema);

    const coupon = await createCoupon(data, admin.id);
    return apiSuccess(coupon, 201, { message: 'Coupon created successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

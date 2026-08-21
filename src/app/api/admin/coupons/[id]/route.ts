import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { updateCouponSchema } from '@/lib/validations/coupon';
import { updateCoupon } from '@/lib/services/coupons.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const data = await validateBody(request, updateCouponSchema);

    const coupon = await updateCoupon(id, data);
    return apiSuccess(coupon, 200, { message: 'Coupon updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

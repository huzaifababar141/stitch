import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { assignOrderToUnit } from '@/lib/services/admin.service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const superAdmin = await requireSuperAdmin();
    const { id } = await context.params;
    const { unitId, reason } = await request.json();

    if (!unitId) throw AppError.badRequest('unitId is required');

    const order = await assignOrderToUnit(id, unitId, superAdmin.id, reason);
    return apiSuccess(order, 200, {
      message: 'Order assigned to tailoring unit successfully.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

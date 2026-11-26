import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { overrideOrderStatus } from '@/lib/services/admin.service';
import { OrderStatus } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminActor();
    if (!actor.isSuperAdmin && !actor.unit) {
      throw AppError.forbidden('No tailoring unit is linked to your account.');
    }
    const { id } = await context.params;
    const { status } = await request.json();

    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw AppError.badRequest('Valid status is required');
    }

    const order = await overrideOrderStatus(id, status, actor.id, {
      isSuperAdmin: actor.isSuperAdmin,
      scopedUnitId: actor.isSuperAdmin ? null : actor.unit!.id,
    });
    return apiSuccess(order, 200, {
      message: 'Status updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

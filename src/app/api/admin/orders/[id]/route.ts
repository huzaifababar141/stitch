import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { getOrder } from '@/lib/services/admin.service';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminActor();
    if (!actor.isSuperAdmin && !actor.unit) {
      throw AppError.forbidden('No tailoring unit is linked to your account.');
    }
    const { id } = await context.params;
    const order = await getOrder(
      id,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(order);
  } catch (error) {
    return handleApiError(error);
  }
}

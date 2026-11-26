import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { assignTailor } from '@/lib/services/admin.service';

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
    const { tailorId } = await request.json();

    if (!tailorId) throw AppError.badRequest('tailorId is required');

    const order = await assignTailor(
      id,
      tailorId,
      actor.id,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(order, 200, { message: 'Tailor assigned successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

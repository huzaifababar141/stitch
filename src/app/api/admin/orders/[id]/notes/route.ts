import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { addAdminNote } from '@/lib/services/admin.service';

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
    const { note } = await request.json();

    if (!note) throw AppError.badRequest('note is required');

    const order = await addAdminNote(
      id,
      note,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(order, 200, { message: 'Note added successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

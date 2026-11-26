import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { getTailor, updateTailor } from '@/lib/services/admin.service';
import { validateBody } from '@/lib/utils/validation';
import { updateTailorSchema } from '@/lib/validations/tailor';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminActor();
    if (!actor.isSuperAdmin && !actor.unit) {
      throw AppError.forbidden('No tailoring unit is linked to your account.');
    }
    const { id } = await params;
    const tailor = await getTailor(
      id,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(tailor);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminActor();
    if (!actor.isSuperAdmin && !actor.unit) {
      throw AppError.forbidden('No tailoring unit is linked to your account.');
    }
    const { id } = await params;
    const data = await validateBody(request, updateTailorSchema);

    const updatedTailor = await updateTailor(
      id,
      data,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(updatedTailor, 200, {
      message: 'Tailor updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

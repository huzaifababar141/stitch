import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { setTailorAvailability } from '@/lib/services/admin.service';

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
    const { isAvailable } = await request.json();

    if (isAvailable === undefined || typeof isAvailable !== 'boolean') {
      throw AppError.badRequest('isAvailable boolean is required');
    }

    const tailor = await setTailorAvailability(
      id,
      isAvailable,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(tailor, 200, {
      message: 'Availability updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { listTailors, createTailor } from '@/lib/services/admin.service';
import { validateBody } from '@/lib/utils/validation';
import { createTailorSchema } from '@/lib/validations/tailor';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireAdminActor();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const requestedUnitId = searchParams.get('unitId');

    if (!actor.isSuperAdmin) {
      if (!actor.unit) {
        return apiSuccess([]);
      }
      const tailors = await listTailors({
        isActive: isActive === null ? undefined : isActive === 'true',
        search,
        unitId: actor.unit.id,
      });
      return apiSuccess(tailors);
    }

    const tailors = await listTailors({
      isActive: isActive === null ? undefined : isActive === 'true',
      search,
      unitId: requestedUnitId,
    });
    return apiSuccess(tailors);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminActor();
    if (!actor.isSuperAdmin && !actor.unit) {
      throw AppError.forbidden('No tailoring unit is linked to your account.');
    }
    const data = await validateBody(request, createTailorSchema);

    const newTailor = await createTailor(
      data,
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(newTailor, 201, {
      message: 'Tailor created successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

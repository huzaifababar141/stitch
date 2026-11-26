import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getRevenueByDay } from '@/lib/services/admin.service';

export async function GET() {
  try {
    const actor = await requireAdminActor();
    if (!actor.isSuperAdmin && !actor.unit) {
      return apiSuccess([]);
    }
    const data = await getRevenueByDay(
      actor.isSuperAdmin ? null : actor.unit!.id
    );
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

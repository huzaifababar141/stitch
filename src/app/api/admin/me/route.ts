import { requireAdminActor } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';

export async function GET() {
  try {
    const actor = await requireAdminActor();
    return apiSuccess(actor);
  } catch (error) {
    return handleApiError(error);
  }
}

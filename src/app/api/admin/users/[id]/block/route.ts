import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { blockUserSchema } from '@/lib/validations/users';
import { setUserBlocked } from '@/lib/services/users.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const { isBlocked, reason } = await validateBody(request, blockUserSchema);

    const user = await setUserBlocked(id, isBlocked, reason, admin.id);
    return apiSuccess(user, 200, {
      message: isBlocked
        ? 'User blocked successfully'
        : 'User unblocked successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

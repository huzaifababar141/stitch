import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { changeRoleSchema } from '@/lib/validations/users';
import { changeUserRole } from '@/lib/services/users.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Elevating roles is sensitive — restrict to super_admin.
    const admin = await requireRole(['super_admin']);
    const { id } = await params;
    const { role } = await validateBody(request, changeRoleSchema);

    const user = await changeUserRole(id, role, admin.id);
    return apiSuccess(user, 200, { message: 'Role updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

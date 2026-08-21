import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { getUser } from '@/lib/services/users.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin', 'super_admin']);
    const { id } = await params;
    const user = await getUser(id);
    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

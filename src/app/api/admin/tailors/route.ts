import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { listTailors, createTailor } from '@/lib/services/admin.service';
import { validateBody } from '@/lib/utils/validation';
import { createTailorSchema } from '@/lib/validations/tailor';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin']);

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const tailors = await listTailors({
      isActive: isActive === null ? undefined : isActive === 'true',
      search,
    });
    return apiSuccess(tailors);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin', 'super_admin']);
    const data = await validateBody(request, createTailorSchema);

    const newTailor = await createTailor(data);
    return apiSuccess(newTailor, 201, {
      message: 'Tailor created successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { requireSuperAdmin } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { validateBody } from '@/lib/utils/validation';
import { createUnitSchema } from '@/lib/validations/unit';
import { listUnits, createUnit } from '@/lib/services/units.service';

export async function GET() {
  try {
    await requireSuperAdmin();
    const units = await listUnits();
    return apiSuccess(units);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const data = await validateBody(request, createUnitSchema);
    const unit = await createUnit(data);
    return apiSuccess(unit, 201, {
      message: `Tailoring unit "${unit.name}" and its Unit Admin account have been created.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

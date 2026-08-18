import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { submitInspection } from '@/lib/services/qc.service';
import { QcResult } from '@prisma/client';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const inspector = await requireRole('qc_inspector', 'admin', 'super_admin');
    const { orderId } = await context.params;
    const data = await request.json();

    if (!data.result || !Object.values(QcResult).includes(data.result)) {
      throw AppError.badRequest('Valid QC result is required');
    }

    const updatedOrder = await submitInspection(inspector.id, orderId, data);
    return apiSuccess(updatedOrder, 200, {
      message: 'Inspection submitted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

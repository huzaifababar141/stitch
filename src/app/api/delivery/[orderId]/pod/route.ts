import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { requireRole } from '@/lib/utils/auth';
import { DeliveryService } from '@/lib/services/delivery.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await requireRole('delivery_agent', 'admin', 'super_admin');
    const { orderId } = await context.params;

    const formData = await request.formData();
    const file = formData.get('podImage') as File | null;

    if (!file) {
      throw AppError.badRequest('No podImage provided');
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw AppError.badRequest('Image too large. Maximum size is 5MB.');
    }

    if (!file.type.startsWith('image/')) {
      throw AppError.badRequest('Invalid file type. Only images are allowed.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const podUrl = await DeliveryService.uploadProofOfDelivery(
      orderId,
      buffer,
      file.name,
      file.type
    );

    return apiSuccess({ podUrl }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

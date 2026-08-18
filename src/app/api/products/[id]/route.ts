import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: productId } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

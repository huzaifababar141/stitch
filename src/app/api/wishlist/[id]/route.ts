import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { metadata: true },
    });

    const meta = (dbUser?.metadata as Record<string, any>) || {};
    const currentWishlist = Array.isArray(meta.wishlist) ? meta.wishlist : [];

    const updatedWishlist = currentWishlist.filter(
      (item: any) => item.id !== id
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        metadata: {
          ...meta,
          wishlist: updatedWishlist,
        },
      },
    });

    return apiSuccess({ id }, 200, {
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

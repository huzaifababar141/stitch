import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { metadata: true },
    });

    const meta = (dbUser?.metadata as Record<string, any>) || {};
    const wishlist = Array.isArray(meta.wishlist) ? meta.wishlist : [];

    return apiSuccess(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      brand = 'Designer Brand',
      title,
      price = 'PKR 4,500',
      image = '/login_bg.jpg',
      url,
      fabric = 'Lawn / Chiffon',
    } = body;

    if (!title || title.trim().length === 0) {
      return handleApiError(new Error('Suit title or name is required'));
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { metadata: true },
    });

    const meta = (dbUser?.metadata as Record<string, any>) || {};
    const currentWishlist = Array.isArray(meta.wishlist) ? meta.wishlist : [];

    const newItem = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      brand: brand.trim(),
      title: title.trim(),
      price:
        typeof price === 'number' ? `PKR ${price.toLocaleString()}` : price,
      image,
      url: url?.trim() || null,
      fabric: fabric.trim(),
      addedAt: new Date().toISOString(),
    };

    const updatedWishlist = [newItem, ...currentWishlist];

    await prisma.user.update({
      where: { id: user.id },
      data: {
        metadata: {
          ...meta,
          wishlist: updatedWishlist,
        },
      },
    });

    return apiSuccess(newItem, 201, {
      message: 'Suit added to your wishlist',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const gender = searchParams.get('gender');
    const fabricType = searchParams.get('fabricType');
    const category =
      searchParams.get('category') ||
      searchParams.get('garmentType') ||
      searchParams.get('garmentSubtype');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '24'))
    );
    const skip = (page - 1) * limit;

    const VALID_PRISMA_GARMENT_TYPES = new Set([
      'kameez',
      'trouser',
      'dupatta',
      'kurta',
      'shalwar',
      'full_suit',
      'kameez_only',
      'trouser_only',
      'other',
    ]);

    const where: any = {
      parseSource: 'in_house',
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (fabricType && fabricType !== 'all') {
      where.fabricType = fabricType;
    }

    const andConditions: any[] = [];

    if (gender && gender !== 'all') {
      andConditions.push({
        parseMetadata: {
          path: ['gender'],
          equals: gender,
        },
      });
    }

    if (category && category !== 'all') {
      const isPrismaEnum = VALID_PRISMA_GARMENT_TYPES.has(category);
      andConditions.push({
        OR: [
          ...(isPrismaEnum ? [{ garmentType: category as any }] : []),
          {
            parseMetadata: {
              path: ['garmentSubtype'],
              equals: category,
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { priceOriginal: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { priceOriginal: 'desc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

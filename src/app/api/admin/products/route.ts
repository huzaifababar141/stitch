import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError, AppError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { createProductSchema } from '@/lib/validations/products';

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin', 'super_admin');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const gender = searchParams.get('gender');
    const fabricType = searchParams.get('fabricType');
    const inStock = searchParams.get('inStock');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: any = {
      parseSource: 'in_house',
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

    // Gender & Stock filtering via JSON parseMetadata
    if (gender && gender !== 'all') {
      where.parseMetadata = {
        path: ['gender'],
        equals: gender,
      };
    }

    if (inStock === 'true') {
      where.isActive = true;
    } else if (inStock === 'false') {
      where.isActive = false;
    }

    const [products, totalCount, allInHouse] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: { parseSource: 'in_house' },
        select: {
          priceOriginal: true,
          isActive: true,
          parseMetadata: true,
        },
      }),
    ]);

    // Calculate Admin Inventory Analytics
    let totalValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;

    for (const p of allInHouse) {
      const price = Number(p.priceOriginal || 0);
      const meta = (p.parseMetadata as Record<string, any>) || {};
      const qty = Number(meta.stockQuantity || 0);

      totalValuation += price * qty;
      if (p.isActive && meta.inStock !== false && qty > 0) {
        inStockCount++;
      }
      if (qty > 0 && qty <= 3) {
        lowStockCount++;
      }
    }

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalArticles: allInHouse.length,
        inStockCount,
        lowStockCount,
        totalValuation,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('admin', 'super_admin');
    const body = await request.json();

    const validated = createProductSchema.parse(body);

    const parseMetadata = {
      gender: validated.gender,
      piecesCount: validated.piecesCount,
      garmentSubtype: validated.garmentSubtype,
      stockQuantity: validated.stockQuantity,
      inStock: validated.inStock && validated.stockQuantity > 0,
      sku: validated.sku || `TLK-${Date.now().toString(36).toUpperCase()}`,
      season: validated.season || 'Current Season',
      specifications: validated.specifications || {},
    };

    const newProduct = await prisma.product.create({
      data: {
        name: validated.name,
        brand: validated.brand,
        description: validated.description || '',
        images: validated.images, // Stored in exact reordered sequence
        fabricType: validated.fabricType,
        garmentType: validated.garmentType,
        colorTags: validated.colorTags,
        priceOriginal: validated.priceOriginal,
        currencyOriginal: 'PKR',
        isActive: validated.isActive,
        parseSource: 'in_house',
        parsedAt: new Date(),
        parseMetadata: parseMetadata as any,
        createdById: user.id,
      },
    });

    return apiSuccess(newProduct, 201, {
      message: 'Article successfully added to in-house stock.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

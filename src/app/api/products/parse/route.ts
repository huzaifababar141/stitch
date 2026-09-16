import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/utils/auth';
import { AppError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';
import {
  parseProductLink,
  extractProductDetails,
} from '@/lib/services/link-parser.service';

const parseProductSchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid JSON body provided',
          },
          message: 'Invalid JSON body provided',
        },
        { status: 400 }
      );
    }

    const validation = parseProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage =
        validation.error.issues[0]?.message || 'Must be a valid URL';
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: errorMessage,
            details: validation.error.format(),
          },
          message: errorMessage,
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Validate protocol (must be http or https)
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'URL must use HTTP or HTTPS protocol',
            },
            message: 'URL must use HTTP or HTTPS protocol',
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid URL format',
          },
          message: 'Invalid URL format',
        },
        { status: 400 }
      );
    }

    // Optional authentication: logged-in user saves to DB, guests parse in memory
    const user = await getAuthUser().catch(() => null);

    let product: any;
    if (user?.id) {
      try {
        product = await parseProductLink(url, user.id);
      } catch (err: any) {
        logger.warn(
          `[ParseRoute] DB persistence parse failed, falling back to pure extractor: ${err?.message}`
        );
        product = await extractProductDetails(url);
      }
    } else {
      product = await extractProductDetails(url);
    }

    const name = product.name || product.title || 'Custom Garment';
    const title = product.title || product.name || 'Custom Garment';
    const brand = product.brand || 'Pakistani Brand';
    const priceOriginal =
      product.priceOriginal !== null && product.priceOriginal !== undefined
        ? Number(product.priceOriginal)
        : null;
    const currencyOriginal = 'PKR' as const;
    const description = product.description || '';
    const images = Array.isArray(product.images)
      ? (product.images as string[])
      : [];
    const gender = (product.gender as 'male' | 'female') || 'female';
    const garmentType = product.garmentType || 'full_suit';
    const fabricMaterial = product.fabricMaterial || null;
    const fallbackTier =
      typeof product.fallbackTier === 'number' ? product.fallbackTier : 1;
    const confidenceScore =
      typeof product.confidenceScore === 'number'
        ? product.confidenceScore
        : 1.0;
    const requiresManualPrice =
      typeof product.requiresManualPrice === 'boolean'
        ? product.requiresManualPrice
        : priceOriginal === null;

    const data: Record<string, any> = {
      ...(product.id ? { id: product.id } : {}),
      name,
      title,
      brand,
      priceOriginal,
      currencyOriginal,
      description,
      images,
      gender,
      garmentType,
      fabricMaterial,
      fallbackTier,
      confidenceScore,
      requiresManualPrice,
    };

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Product parsed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(`[ParseRoute] Error parsing product: ${error?.message}`);

    if (error instanceof AppError && error.statusCode < 500) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    // Never return 500 on invalid or problematic URLs
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message:
            error?.message ||
            'Unable to parse product link. Please check the URL.',
        },
        message:
          error?.message ||
          'Unable to parse product link. Please check the URL.',
      },
      { status: 400 }
    );
  }
}

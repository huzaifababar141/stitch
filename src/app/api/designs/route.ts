import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { GarmentType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const designs = await prisma.styleConfiguration.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiSuccess(designs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      label,
      garmentType = 'full_suit',
      galaStyle,
      sleeveStyle,
      sleeveHemStyle,
      kameezHemStyle,
      sideCutStyle,
      backStyle,
      trouserStyle,
      trouserHemStyle,
      pocketPreference,
      liningRequired = false,
      liningColor,
      embroideryOnGala = false,
      embroideryOnSleeve = false,
      embroideryNotes,
      specialInstructions,
      referenceImages = [],
    } = body;

    if (!label || label.trim().length === 0) {
      return handleApiError(new Error('Style preset name/label is required'));
    }

    const validGarmentType = Object.values(GarmentType).includes(garmentType)
      ? garmentType
      : GarmentType.full_suit;

    const newDesign = await prisma.styleConfiguration.create({
      data: {
        userId: user.id,
        label: label.trim(),
        garmentType: validGarmentType,
        galaStyle: galaStyle || null,
        sleeveStyle: sleeveStyle || null,
        sleeveHemStyle: sleeveHemStyle || null,
        kameezHemStyle: kameezHemStyle || null,
        sideCutStyle: sideCutStyle || null,
        backStyle: backStyle || null,
        trouserStyle: trouserStyle || null,
        trouserHemStyle: trouserHemStyle || null,
        pocketPreference: pocketPreference || null,
        liningRequired: Boolean(liningRequired),
        liningColor: liningColor || null,
        embroideryOnGala: Boolean(embroideryOnGala),
        embroideryOnSleeve: Boolean(embroideryOnSleeve),
        embroideryNotes: embroideryNotes || null,
        specialInstructions: specialInstructions || null,
        referenceImages: referenceImages || [],
      },
    });

    return apiSuccess(newDesign, 201, {
      message: 'Design preset saved successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

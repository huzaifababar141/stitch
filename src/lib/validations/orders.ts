import { z } from 'zod';
import { GarmentType } from '@prisma/client';

export const createOrderSchema = z.object({
  productId: z.string().uuid().optional(),
  garmentType: z.nativeEnum(GarmentType).default('full_suit'),
  measurementProfileId: z.string().uuid().optional(),
  customMeasurements: z.record(z.string(), z.any()).optional(),
  styleConfigId: z.string().uuid().optional(),
  stylePreferences: z
    .object({
      neckStyle: z.string().optional(),
      sleeveStyle: z.string().optional(),
      fitType: z.string().optional(),
      specialInstructions: z.string().optional(),
    })
    .optional(),
  deliveryAddressId: z.string().uuid().optional(),
  customAddress: z
    .object({
      fullName: z.string(),
      phone: z.string(),
      addressLine1: z.string(),
      city: z.string(),
      province: z.string(),
      landmark: z.string().optional(),
    })
    .optional(),
  couponCode: z.string().optional(),
  internalNotes: z.string().optional(),
  stitchingTier: z
    .enum(['standard', 'premium', 'luxury'])
    .optional()
    .default('standard'),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export const submitFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
  fitRating: z.number().min(1).max(5).optional(),
  fabricQualityRating: z.number().min(1).max(5).optional(),
  deliveryRating: z.number().min(1).max(5).optional(),
});

import { z } from 'zod'
import { GarmentType } from '@prisma/client'

export const createOrderSchema = z.object({
  productId: z.string().uuid().optional(),
  garmentType: z.nativeEnum(GarmentType),
  measurementProfileId: z.string().uuid(),
  styleConfigId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  couponCode: z.string().optional(),
  internalNotes: z.string().optional(),
})

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters long')
})

export const submitFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
  fitRating: z.number().min(1).max(5).optional(),
  fabricQualityRating: z.number().min(1).max(5).optional(),
  deliveryRating: z.number().min(1).max(5).optional(),
})

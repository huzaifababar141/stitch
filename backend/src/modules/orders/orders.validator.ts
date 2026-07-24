import { z } from 'zod';
import { GarmentType, PaymentMethod } from '@prisma/client';

export const createOrderSchema = z.object({
  productId: z.string().uuid('Invalid product ID format').optional().nullable(),
  garmentType: z.nativeEnum(GarmentType),
  measurementProfileId: z.string().uuid('Invalid measurement profile ID format'),
  styleConfigId: z.string().uuid('Invalid style configuration ID format').optional().nullable(),
  styleOverrides: z.record(z.any()).optional().nullable(),
  deliveryAddressId: z.string().uuid('Invalid delivery address ID format'),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  specialInstructions: z.string().max(1000).optional().nullable(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
});

export const submitFeedbackSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  qualityRating: z.number().int().min(1).max(5).optional(),
  fitRating: z.number().int().min(1).max(5).optional(),
  deliveryRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional().nullable(),
  images: z.array(z.string().url('Invalid image URL')).optional().default([]),
});

export const calculateTotalSchema = z.object({
  garmentType: z.nativeEnum(GarmentType),
  city: z.string().min(1, 'City is required'),
  couponCode: z.string().optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type SubmitFeedbackInput = z.input<typeof submitFeedbackSchema>;
export type CalculateTotalInput = z.infer<typeof calculateTotalSchema>;

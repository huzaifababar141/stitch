import { z } from 'zod';
import { CouponType } from '@prisma/client';

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Code must be at least 3 characters')
      .max(50)
      .transform((s) => s.trim().toUpperCase()),
    description: z.string().optional(),
    discountType: z.nativeEnum(CouponType),
    discountValue: z.number().positive('Discount value must be greater than 0'),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.discountType !== 'percentage' || d.discountValue <= 100, {
    message: 'Percentage discount cannot exceed 100',
    path: ['discountValue'],
  });

export const updateCouponSchema = z.object({
  description: z.string().optional(),
  discountType: z.nativeEnum(CouponType).optional(),
  discountValue: z.number().positive().optional(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

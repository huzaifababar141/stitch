import { z } from 'zod';
import { Gender } from '@prisma/client';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().max(100).optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

export const createAddressSchema = z.object({
  label: z.string().max(50).optional().nullable(),
  fullName: z.string().min(1, 'Full name is required').max(200),
  phone: z.string().min(10, 'Valid phone number is required').max(20),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required').max(100),
  province: z.string().min(1, 'Province is required').max(100),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().default('Pakistan'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.input<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

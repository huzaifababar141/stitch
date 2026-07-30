import { z } from 'zod'
import { Gender } from '@prisma/client'

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().datetime().optional().or(z.date().optional()),
})

export const createAddressSchema = z.object({
  title: z.string().min(1, 'Title is required (e.g., Home, Work)'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('Pakistan'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().default(false),
  deliveryInstructions: z.string().optional(),
})

export const updateAddressSchema = createAddressSchema.partial()

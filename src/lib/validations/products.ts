import { z } from 'zod';
import { FabricType, GarmentType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(3, 'Article name must be at least 3 characters').max(500),
  brand: z.string().min(2, 'Brand name must be at least 2 characters').max(200),
  description: z.string().optional().default(''),
  images: z.array(z.string().url()).min(1, 'At least 1 product picture is required'),
  fabricType: z.nativeEnum(FabricType).default('lawn'),
  garmentType: z.nativeEnum(GarmentType).default('full_suit'),
  colorTags: z.array(z.string()).default([]),
  priceOriginal: z.number().min(0, 'Price must be a positive number'),
  currencyOriginal: z.string().default('PKR'),
  isActive: z.boolean().default(true),

  // In-House Boutique Metadata
  gender: z.enum(['female', 'male', 'unisex']).default('female'),
  piecesCount: z.string().default('3 Piece'),
  garmentSubtype: z.string().default('full_suit'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(10),
  inStock: z.boolean().default(true),
  sku: z.string().optional(),
  season: z.string().optional(),
  specifications: z
    .object({
      shirtFabric: z.string().optional(),
      dupattaFabric: z.string().optional(),
      trouserFabric: z.string().optional(),
      careInstructions: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

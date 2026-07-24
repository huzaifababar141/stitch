import { z } from 'zod';

const measurementValueSchema = z
  .number({ invalid_type_error: 'Measurement value must be a number' })
  .min(10, 'Measurement must be at least 10 cm')
  .max(200, 'Measurement cannot exceed 200 cm')
  .optional()
  .nullable();

export const createMeasurementSchema = z.object({
  label: z.string().min(1, 'Profile label is required').max(100).default('My Measurements'),
  isDefault: z.boolean().optional().default(false),
  
  // Upper body (cm)
  chest: measurementValueSchema,
  waist: measurementValueSchema,
  hips: measurementValueSchema,
  shoulderWidth: measurementValueSchema,
  backLength: measurementValueSchema,
  frontLength: measurementValueSchema,
  sleeveLength: measurementValueSchema,
  armhole: measurementValueSchema,
  bicep: measurementValueSchema,
  wrist: measurementValueSchema,
  neckCircumference: measurementValueSchema,

  // Lower body (cm)
  trouserLength: measurementValueSchema,
  thigh: measurementValueSchema,
  knee: measurementValueSchema,
  calf: measurementValueSchema,
  ankle: measurementValueSchema,
  trouserWaist: measurementValueSchema,
  seat: measurementValueSchema,

  // Style / Garment lengths (cm)
  kameezLength: measurementValueSchema,
  galaDepth: measurementValueSchema,

  // Media & Notes
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  photoUrls: z.array(z.string().url('Invalid photo URL')).optional().default([]),
});

export const updateMeasurementSchema = createMeasurementSchema.partial();

export type CreateMeasurementInput = z.input<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.input<typeof updateMeasurementSchema>;

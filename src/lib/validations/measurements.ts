import { z } from 'zod';

const measurementField = z
  .number()
  .positive('Must be positive')
  .min(1, 'Minimum value is 1')
  .max(250, 'Maximum value is 250')
  .optional();

export const createMeasurementSchema = z.object({
  label: z.string().min(1, 'Label is required').default('My Measurements'),
  isDefault: z.boolean().default(false),

  // Upper body
  chest: measurementField,
  waist: measurementField,
  hips: measurementField,
  shoulderWidth: measurementField,
  backLength: measurementField,
  frontLength: measurementField,
  sleeveLength: measurementField,
  armhole: measurementField,
  bicep: measurementField,
  wrist: measurementField,
  neckCircumference: measurementField,

  // Lower body
  trouserLength: measurementField,
  thigh: measurementField,
  knee: measurementField,
  calf: measurementField,
  ankle: measurementField,
  trouserWaist: measurementField,
  seat: measurementField,

  // Style
  kameezLength: measurementField,
  galaDepth: measurementField,

  photoUrls: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateMeasurementSchema = createMeasurementSchema.partial();

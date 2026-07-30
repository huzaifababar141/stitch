import { z } from 'zod'

const measurementField = z.number({
  invalid_type_error: "Must be a number (ہندسہ ہونا چاہیے)",
})
.positive("Must be positive (مثبت ہونا چاہیے)")
.min(10, "Minimum 10 cm (کم از کم 10 سم)")
.max(200, "Maximum 200 cm (زیادہ سے زیادہ 200 سم)")
.optional()

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
  
  notes: z.string().optional(),
})

export const updateMeasurementSchema = createMeasurementSchema.partial()

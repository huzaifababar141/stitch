import { z } from 'zod';

const pkPhone = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return v;
    const cleaned = v.replace(/[\s-]/g, '');
    if (/^03\d{9}$/.test(cleaned)) return '+92' + cleaned.slice(1);
    return cleaned;
  },
  z
    .string()
    .regex(
      /^\+92\d{10}$/,
      'Phone must be in format +923XXXXXXXXX or 03XXXXXXXXX'
    )
);

export const createUnitSchema = z.object({
  name: z.string().min(2, 'Unit name must be at least 2 characters').max(200),
  location: z
    .string()
    .min(2, 'Unit location must be at least 2 characters')
    .max(300),
  city: z.string().min(2).max(100).default('Lahore'),
  maxDailyCapacity: z.coerce.number().int().min(1).max(500).default(10),
  hasStockAccess: z.boolean().default(false),
  notes: z.string().max(1000).optional(),

  // Manager (Unit Admin) credentials
  managerFirstName: z
    .string()
    .min(2, 'Manager first name must be at least 2 characters')
    .max(100),
  managerLastName: z.string().max(100).optional().default(''),
  managerEmail: z.string().email('Valid manager email is required'),
  managerPhone: pkPhone,
  managerPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

export const updateUnitSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  location: z.string().min(2).max(300).optional(),
  city: z.string().min(2).max(100).optional(),
  maxDailyCapacity: z.coerce.number().int().min(1).max(500).optional(),
  hasStockAccess: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
  managerFirstName: z.string().min(2).max(100).optional(),
  managerLastName: z.string().max(100).optional(),
  managerPhone: pkPhone.optional(),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

import { z } from 'zod';
import { TailorSkillLevel } from '@prisma/client';

const optionalEmail = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.string().email('Invalid email address').optional()
);

export const createTailorSchema = z.object({
  phone: z
    .string()
    .regex(/^\+92\d{10}$/, 'Phone must be in format +923XXXXXXXXX'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  email: optionalEmail,
  employeeId: z.string().optional(),
  skillLevel: z.nativeEnum(TailorSkillLevel).optional(),
  maxDailyCapacity: z.number().int().min(1).max(50).optional(),
});

export const updateTailorSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .optional(),
  lastName: z.string().optional(),
  email: optionalEmail,
  employeeId: z.string().optional(),
  skillLevel: z.nativeEnum(TailorSkillLevel).optional(),
  maxDailyCapacity: z.number().int().min(1).max(50).optional(),
});

export type CreateTailorInput = z.infer<typeof createTailorSchema>;
export type UpdateTailorInput = z.infer<typeof updateTailorSchema>;

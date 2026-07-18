import { z } from 'zod';

const phoneRegex = /^\+92\d{10}$/;

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Invalid phone number format. Must be +92XXXXXXXXXX'),
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Invalid phone number format. Must be +92XXXXXXXXXX'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    purpose: z.enum(['login', 'register', 'verification'])
  })
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Invalid phone number format. Must be +92XXXXXXXXXX'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  })
});

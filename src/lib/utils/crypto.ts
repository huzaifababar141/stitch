import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function hashValue(value: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(value, salt)
}

export async function verifyHash(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash)
}

export function sanitizeInput(input: string): string {
  if (!input) return ''
  return input.trim().replace(/[<>]/g, '') // Basic HTML tag stripping
}

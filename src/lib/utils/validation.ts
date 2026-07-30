import { NextRequest } from 'next/server'
import { ZodSchema } from 'zod'
import { AppError } from './errors'

export async function validateBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw AppError.badRequest('Invalid JSON body')
    }
    // Zod errors are caught by handleApiError using instanceof ZodError, so we just throw it further
    throw error
  }
}

export function validateQuery<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  const params = Object.fromEntries(searchParams.entries())
  return schema.parse(params)
}

export function validateParams<T>(params: Record<string, string>, schema: ZodSchema<T>): T {
  return schema.parse(params)
}

import { NextResponse } from 'next/server'
import { apiError } from './response'
import { ZodError } from 'zod'

export class AppError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(msg: string, details?: any) {
    return new AppError(msg, 400, 'BAD_REQUEST', details)
  }
  static unauthorized(msg = 'Unauthorized') {
    return new AppError(msg, 401, 'UNAUTHORIZED')
  }
  static forbidden(msg = 'Forbidden') {
    return new AppError(msg, 403, 'FORBIDDEN')
  }
  static notFound(msg = 'Not Found') {
    return new AppError(msg, 404, 'NOT_FOUND')
  }
  static conflict(msg: string) {
    return new AppError(msg, 409, 'CONFLICT')
  }
  static unprocessable(msg: string, details?: any) {
    return new AppError(msg, 422, 'UNPROCESSABLE_ENTITY', details)
  }
  static tooManyRequests(msg = 'Too Many Requests') {
    return new AppError(msg, 429, 'TOO_MANY_REQUESTS')
  }
  static internal(msg = 'Internal Server Error') {
    return new AppError(msg, 500, 'INTERNAL_SERVER_ERROR')
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return apiError(error.code, error.message, error.statusCode, error.details)
  }
  
  if (error instanceof ZodError) {
    return apiError('VALIDATION_ERROR', 'Invalid data provided', 422, error.format())
  }
  
  console.error('Unhandled Exception:', error)
  return apiError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', 500)
}

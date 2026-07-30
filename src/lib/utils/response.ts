import { NextResponse } from 'next/server'
import { ApiResponse, PaginatedResponse } from '../types'

export function apiSuccess<T>(data: T, status = 200, meta?: any): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export function apiError(code: string, message: string, status = 400, details?: any): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export function apiPaginated<T>(data: T[], total: number, page: number, limit: number): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

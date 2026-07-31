import { NextResponse } from 'next/server'

export async function GET() {
  // Liveness probe just checks if the HTTP server is responsive
  return new NextResponse('OK', { status: 200 })
}

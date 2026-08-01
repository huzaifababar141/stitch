import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('WhatsApp Webhook verified successfully')
      return new NextResponse(challenge, { status: 200 })
    }
    return new NextResponse('Forbidden', { status: 403 })
  }

  return new NextResponse('Bad Request', { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log the incoming WhatsApp message
    logger.info('Incoming WhatsApp Webhook Payload:', JSON.stringify(body))

    // Handle messages (e.g., pass to chatbot module later)
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              const from = message.from
              const text = message.text?.body
              logger.info(`Received WhatsApp message from ${from}: ${text}`)
              
              // Future: Forward to Chatbot service
            }
          }
        }
      }
    }

    // Acknowledge receipt
    return new NextResponse('EVENT_RECEIVED', { status: 200 })
  } catch (error) {
    logger.error('WhatsApp Webhook Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

import { logger } from '../utils/logger'

interface TcsBookingPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  weight: number;
  codAmount: number;
}

interface TcsBookingResponse {
  success: boolean;
  trackingNumber?: string;
  bookingId?: string;
  labelUrl?: string;
  error?: string;
}

export class TcsService {
  private static apiUrl = process.env.TCS_API_URL || 'https://api.tcsexpress.com/v1'
  private static apiKey = process.env.TCS_API_KEY || ''
  private static isMock = process.env.TCS_MOCK === 'true'

  static async bookShipment(payload: TcsBookingPayload): Promise<TcsBookingResponse> {
    if (this.isMock) {
      logger.info(`[TCS MOCK] Booking shipment for Order ${payload.orderId}`)
      return {
        success: true,
        trackingNumber: `TCS-MOCK-${Date.now().toString().slice(-8)}`,
        bookingId: `B-${Date.now()}`,
        labelUrl: `https://mock.tcs.com/label/${payload.orderId}.pdf`
      }
    }

    try {
      const response = await fetch(`${this.apiUrl}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          reference_number: payload.orderId,
          consignee_name: payload.customerName,
          consignee_phone: payload.customerPhone,
          consignee_address: payload.customerAddress,
          consignee_city: payload.customerCity,
          weight: payload.weight,
          cod_amount: payload.codAmount,
          service_type: 'OVERNIGHT'
        })
      })

      const data = await response.json()
      
      if (!response.ok || data.error) {
        logger.error(`[TCS] Booking failed for ${payload.orderId}`, data)
        return { success: false, error: data.message || 'TCS API Error' }
      }

      return {
        success: true,
        trackingNumber: data.tracking_number,
        bookingId: data.booking_id,
        labelUrl: data.label_url
      }
    } catch (error) {
      logger.error(`[TCS] Network error during booking`, error)
      return { success: false, error: 'Network error connecting to TCS' }
    }
  }

  static async trackShipment(trackingNumber: string) {
    if (this.isMock) {
      return {
        success: true,
        status: 'in_transit',
        location: 'Lahore Hub',
        timestamp: new Date().toISOString()
      }
    }

    try {
      const response = await fetch(`${this.apiUrl}/track/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      const data = await response.json()
      return data
    } catch (error) {
      logger.error(`[TCS] Tracking failed for ${trackingNumber}`, error)
      return { success: false, error: 'Tracking failed' }
    }
  }

  static async cancelShipment(trackingNumber: string) {
    if (this.isMock) {
      logger.info(`[TCS MOCK] Cancelled shipment ${trackingNumber}`)
      return { success: true }
    }
    
    // Real API cancellation logic
    try {
      const response = await fetch(`${this.apiUrl}/cancel/${trackingNumber}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      const data = await response.json()
      return { success: response.ok, ...data }
    } catch (error) {
      logger.error(`[TCS] Cancel failed for ${trackingNumber}`, error)
      return { success: false, error: 'Cancellation failed' }
    }
  }
}

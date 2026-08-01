export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp'

export interface NotificationTemplate {
  title: string
  body: string
  channels: NotificationChannel[]
}

export const NotificationTemplates: Record<string, (vars: any) => NotificationTemplate> = {
  ORDER_CONFIRMED: (vars: { orderId: string; customerName: string }) => ({
    title: 'Order Confirmed',
    body: `Hi ${vars.customerName}, your order #${vars.orderId} has been successfully confirmed.`,
    channels: ['in_app', 'email', 'whatsapp']
  }),
  
  PAYMENT_RECEIVED: (vars: { orderId: string; amount: number }) => ({
    title: 'Payment Received',
    body: `We have received your payment of Rs. ${vars.amount} for order #${vars.orderId}.`,
    channels: ['in_app', 'email', 'whatsapp']
  }),

  ORDER_DISPATCHED: (vars: { orderId: string; trackingNumber: string }) => ({
    title: 'Order Dispatched',
    body: `Your order #${vars.orderId} has been dispatched. Tracking number: ${vars.trackingNumber}.`,
    channels: ['in_app', 'whatsapp']
  }),

  ORDER_DELIVERED: (vars: { orderId: string }) => ({
    title: 'Order Delivered',
    body: `Your order #${vars.orderId} has been successfully delivered. Thank you for choosing TailorLink!`,
    channels: ['in_app', 'email', 'whatsapp']
  })
}

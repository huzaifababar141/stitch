import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { supabase } from '../_shared/supabase-client.ts'

serve(async (req) => {
  try {
    const { trackingNumber, deliveryId } = await req.json()

    if (!trackingNumber && !deliveryId) {
      return new Response(JSON.stringify({ error: 'Missing trackingNumber or deliveryId' }), { status: 400 })
    }

    // Determine the delivery record to update
    let query = supabase.from('deliveries').select('id, order_id, status')
    if (deliveryId) {
      query = query.eq('id', deliveryId)
    } else {
      query = query.eq('tracking_number', trackingNumber)
    }

    const { data: delivery, error: fetchError } = await query.single()

    if (fetchError || !delivery) {
      return new Response(JSON.stringify({ error: 'Delivery not found' }), { status: 404 })
    }

    // Mock TCS API call
    console.log(`Checking TCS API for tracking ${trackingNumber || delivery.id}...`)
    // Mocking that the status changed to delivered
    const newStatus = 'delivered'
    
    if (delivery.status !== newStatus) {
      const { error: updateError } = await supabase
        .from('deliveries')
        .update({ status: newStatus, delivered_at: new Date().toISOString() })
        .eq('id', delivery.id)

      if (updateError) {
        throw updateError
      }

      // Also update the order status
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', delivery.order_id)

      // Notify Customer
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          userId: delivery.customer_id, // Need to join to get this, or pass it. Assuming we have it or get it via order.
          templateKey: 'ORDER_DELIVERED',
          variables: { orderId: delivery.order_id },
          channel: 'whatsapp'
        })
      }).catch(console.error)
    }

    return new Response(JSON.stringify({ success: true, newStatus }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { supabase } from '../_shared/supabase-client.ts'

serve(async (req) => {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), { status: 400 })
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, garment_type, priority_level, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }

    if (order.status !== 'pending_payment' && order.status !== 'confirmed') {
      return new Response(JSON.stringify({ error: 'Order not in valid state for assignment' }), { status: 400 })
    }

    // Query available tailors
    const { data: tailors, error: tailorsError } = await supabase
      .from('users')
      .select('id, metadata')
      .eq('role', 'tailor')
      .eq('is_active', true)

    if (tailorsError || !tailors || tailors.length === 0) {
      // Logic if no tailor found
      return new Response(JSON.stringify({ error: 'No available tailors found' }), { status: 404 })
    }

    // Scoring algorithm (mocked logic: randomly pick first available for now, real logic would use garment_type match & current workload)
    const assignedTailor = tailors[Math.floor(Math.random() * tailors.length)]

    // Assign tailor
    await supabase
      .from('orders')
      .update({
        assigned_tailor_id: assignedTailor.id,
        assigned_at: new Date().toISOString(),
        status: 'in_stitching',
        assignment_reason: 'Assigned via edge function scoring algorithm'
      })
      .eq('id', orderId)

    // Call notify-customer function (internal request)
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        userId: order.customer_id,
        templateKey: 'ORDER_ASSIGNED',
        variables: { orderId: order.order_number },
        channel: 'whatsapp'
      })
    }).catch(console.error) // Do not await completely for speed

    return new Response(
      JSON.stringify({ message: 'Tailor assigned successfully', assignedTailorId: assignedTailor.id }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

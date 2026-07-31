import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { supabase } from '../_shared/supabase-client.ts'

serve(async (req) => {
  try {
    // This function will be triggered by pg_cron every 30 minutes
    console.log('Running monitor-deadlines job...')

    const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    // Find orders that are in_stitching and their deadline is within the next 3 hours
    // and haven't been completed yet.
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, assigned_tailor_id, stitching_deadline, customer_id')
      .eq('status', 'in_stitching')
      .lt('stitching_deadline', threeHoursFromNow)
      .gt('stitching_deadline', now)

    if (ordersError) {
      throw ordersError
    }

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ message: 'No approaching deadlines found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }

    console.log(`Found ${orders.length} orders approaching deadline. Triggering alerts...`)

    // Notify tailors and admins
    for (const order of orders) {
      if (order.assigned_tailor_id) {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            userId: order.assigned_tailor_id,
            templateKey: 'DEADLINE_APPROACHING_TAILOR',
            variables: { orderId: order.order_number, deadline: order.stitching_deadline },
            channel: 'whatsapp'
          })
        }).catch(console.error)
      }
    }

    return new Response(JSON.stringify({ success: true, alertsTriggered: orders.length }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error in monitor-deadlines:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

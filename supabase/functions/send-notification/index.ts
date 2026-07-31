import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { supabase } from '../_shared/supabase-client.ts'

serve(async (req) => {
  try {
    const { userId, templateKey, variables, channel, orderId } = await req.json()

    if (!userId || !templateKey || !channel) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    // 1. Fetch User
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, email, first_name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    // 2. Logic to route based on channel
    let deliveryStatus = 'pending'
    let providerResponse = null

    if (channel === 'whatsapp') {
      // Mock WhatsApp API call
      console.log(`Sending WhatsApp to ${user.phone} using template ${templateKey}`)
      deliveryStatus = 'sent'
      providerResponse = { messageId: 'wa_' + Date.now() }
    } else if (channel === 'email') {
      // Mock Email API call (Resend, etc.)
      console.log(`Sending Email to ${user.email} using template ${templateKey}`)
      deliveryStatus = 'sent'
      providerResponse = { messageId: 'email_' + Date.now() }
    } else {
      // In-app push
      console.log(`Sending In-App Push to user ${user.id}`)
      deliveryStatus = 'sent'
    }

    // 3. Save Notification Record
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        order_id: orderId,
        type: templateKey,
        channel,
        title: `Notification: ${templateKey}`, // You would typically render the actual template here
        content: JSON.stringify(variables),
        is_read: false,
      })

    if (dbError) {
      console.error('Failed to log notification:', dbError)
    }

    return new Response(JSON.stringify({ success: true, deliveryStatus, providerResponse }), {
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

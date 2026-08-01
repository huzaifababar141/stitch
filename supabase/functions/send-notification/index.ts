// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
    }

    const { notificationId } = await req.json()

    if (!notificationId) {
      return new Response(JSON.stringify({ error: 'notificationId is required' }), { status: 400 })
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the notification
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*, user:users(*)')
      .eq('id', notificationId)
      .single()

    if (fetchError || !notification) {
      console.error('Failed to fetch notification', fetchError)
      return new Response(JSON.stringify({ error: 'Notification not found' }), { status: 404 })
    }

    const { channels, user, title, message } = notification

    console.log(`Processing notification ${notificationId} for user ${user.id}`)

    // 1. Send Email via Resend/SendGrid
    if (channels.includes('email') && user.email) {
      console.log(`[EMAIL] Sending to ${user.email}: ${title}`)
      // Example external API call here
    }

    // 2. Send WhatsApp via Meta Graph API
    if (channels.includes('whatsapp') && user.phoneNumber) {
      console.log(`[WHATSAPP] Sending to ${user.phoneNumber}: ${message}`)
      // Example WhatsApp Cloud API call here
    }

    // Mark as sent
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ status: 'sent' })
      .eq('id', notificationId)

    if (updateError) {
      throw updateError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
})

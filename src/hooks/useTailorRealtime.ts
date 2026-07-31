'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '@/hooks/use-toast'

export function useTailorRealtime(tailorId?: string) {
  const { toast } = useToast()

  useEffect(() => {
    if (!tailorId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`tailor-${tailorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `assigned_tailor_id=eq.${tailorId}`
        },
        (payload) => {
          // Check if newly assigned to this tailor
          if (payload.new.assigned_tailor_id === tailorId && payload.old.assigned_tailor_id !== tailorId) {
            toast({
              title: 'New Order Assigned',
              description: `Order ${payload.new.order_number} has been assigned to you.`,
            })
            
            try {
              const audio = new Audio('/sounds/notification.mp3')
              audio.play().catch(() => {})
            } catch (e) {}
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tailorId, toast])
}

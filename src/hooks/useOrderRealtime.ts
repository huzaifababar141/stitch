'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '@/hooks/use-toast'

// Helper to format order status nicely
function getOrderStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function useOrderRealtime(orderId: string) {
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!orderId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const newStatus = payload.new.status
          if (newStatus && newStatus !== payload.old.status) {
            setOrderStatus(newStatus)
            toast({
              title: 'Order Update',
              description: `Your order status changed to: ${getOrderStatusLabel(newStatus)}`
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, toast])

  return { orderStatus }
}

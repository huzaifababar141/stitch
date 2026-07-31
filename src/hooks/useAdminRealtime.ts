'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '@/hooks/use-toast'

export function useAdminRealtime() {
  const { toast } = useToast()
  const [newOrdersCount, setNewOrdersCount] = useState(0)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel('admin-dashboard')
      // Listen for NEW orders
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setNewOrdersCount(prev => prev + 1)
          toast({
            title: 'New Order Received!',
            description: `Order ${payload.new.order_number} has been placed.`,
          })
          
          // Play notification sound
          try {
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => {})
          } catch (e) {}
        }
      )
      // Listen for QC ready orders (Stitching Complete)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders', 
          filter: 'status=eq.stitching_complete' 
        },
        (payload) => {
          if (payload.old.status !== 'stitching_complete') {
            toast({
              title: 'Order Ready for QC',
              description: `Order ${payload.new.order_number} has completed stitching.`,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  const resetNewOrdersCount = () => setNewOrdersCount(0)

  return { newOrdersCount, resetNewOrdersCount }
}

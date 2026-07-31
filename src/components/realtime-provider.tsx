'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

// The provider ensures Supabase Realtime is connected eagerly 
// and optionally exposes a global client.

type RealtimeContextType = {
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextType>({ isConnected: false })

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Optional: a generic global channel or presence can be set up here
    const channel = supabase.channel('system-global')
    
    channel
      .on('system' as any, { event: '*' }, (payload) => {
        console.log('Global system event:', payload)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadCount(clientId: string | null, role: 'client' | 'admin'): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!clientId) return

    const supabase = createClient()
    if (!supabase) return

    const otherRole = role === 'client' ? 'admin' : 'client'

    // Initial fetch
    const fetchCount = async () => {
      const { count: c } = await supabase
        .from('portal_messages')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('sender_role', otherRole)
        .is('read_at', null)
      setCount(c ?? 0)
    }

    fetchCount()

    // Realtime subscription
    const channel = supabase
      .channel(`unread-${clientId}-${role}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portal_messages',
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, role])

  return count
}

"use client"

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => {
          if (typeof document === 'undefined') return ''
          const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
          return match ? decodeURIComponent(match[2]) : ''
        },
      },
    }
  )
}

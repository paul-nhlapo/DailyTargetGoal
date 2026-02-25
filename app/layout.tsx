import './globals.css'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { hasSupabaseEnv } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Daily Target Goal',
  description: 'Timebox your day with a focused 16-hour window',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = !hasSupabaseEnv()
  let user: any = null
  if (!demo) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-800">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">DTG</Link>
            <nav className="flex items-center gap-3">
              {!demo && user ? (
                <>
                  <Link className="text-sm text-slate-300 hover:text-white" href="/today">Today</Link>
                  <Link className="text-sm text-slate-300 hover:text-white" href="/analytics">Analytics</Link>
                  <form action="/auth/signout" method="post">
                    <button className="btn" type="submit">Sign out</button>
                  </form>
                </>
              ) : (
                <Link className="btn" href="/login">Login</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const form = await req.formData()
  const email = String(form.get('email') || '')
  const password = String(form.get('password') || '')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error.message), req.url))
  return NextResponse.redirect(new URL('/today', req.url))
}

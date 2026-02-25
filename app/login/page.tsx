import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/today')

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="grid gap-3" action="/auth/signin" method="post">
        <input className="input" type="email" name="email" placeholder="Email" required />
        <input className="input" type="password" name="password" placeholder="Password" required />
        <button className="btn" type="submit">Sign in</button>
      </form>
      <form className="mt-4 grid gap-3" action="/auth/signup" method="post">
        <input className="input" type="email" name="email" placeholder="Email" />
        <input className="input" type="password" name="password" placeholder="Password" />
        <button className="btn w-full" type="submit">Create account</button>
      </form>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/today')

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      
      {searchParams.error && (
        <div className="mb-4 p-3 rounded bg-red-900/50 border border-red-700 text-red-200 text-sm">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}
      
      {searchParams.success && (
        <div className="mb-4 p-3 rounded bg-green-900/50 border border-green-700 text-green-200 text-sm">
          {decodeURIComponent(searchParams.success)}
        </div>
      )}
      
      <form className="grid gap-3" action="/auth/signin" method="post">
        <input className="input" type="email" name="email" placeholder="Email" required />
        <input className="input" type="password" name="password" placeholder="Password" required />
        <button className="btn" type="submit">Sign in</button>
      </form>
      
      <div className="my-4 text-center text-slate-400 text-sm">or</div>
      
      <form className="grid gap-3" action="/auth/signup" method="post">
        <input className="input" type="email" name="email" placeholder="Email" required />
        <input className="input" type="password" name="password" placeholder="Password (min 6 chars)" required minLength={6} />
        <button className="btn w-full" type="submit">Create account</button>
      </form>
    </div>
  )
}

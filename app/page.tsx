import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Daily Target Goal</h1>
      <p className="text-slate-300">Timebox your day into a focused 16-hour window with Supabase-backed tasks.</p>
      <div className="flex gap-3">
        <Link className="btn" href="/login">Login</Link>
        <Link className="btn" href="/today">Go to Today</Link>
      </div>
    </div>
  )
}

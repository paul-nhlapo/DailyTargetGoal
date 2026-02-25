import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { addHours, formatISO, format } from 'date-fns'
import { redirect } from 'next/navigation'
import { TodayTasks } from '@/components/today-tasks'

export default async function TodayPage() {
  const demo = !hasSupabaseEnv()
  let user: any = null
  
  if (!demo) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) redirect('/login')
  }

  // 16-hour window starts at 4 AM
  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(4, 0, 0, 0)
  
  // If it's before 4 AM, use yesterday's 4 AM
  if (now.getHours() < 4) {
    dayStart.setDate(dayStart.getDate() - 1)
  }
  
  const dayEnd = addHours(dayStart, 16)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Today - {format(dayStart, 'PPPP')}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card">
          <TodayTasks startIso={formatISO(dayStart)} endIso={formatISO(dayEnd)} />
        </div>
        <aside className="card">
          <h2 className="font-semibold mb-2">16-hour Window</h2>
          <p className="text-sm text-slate-300">{format(dayStart, 'p')} - {format(dayEnd, 'p')}</p>
          <p className="mt-2 text-sm text-slate-400">{demo ? 'Demo mode: local-only tasks.' : 'Log tasks in your day.'}</p>
        </aside>
      </div>
    </div>
  )
}

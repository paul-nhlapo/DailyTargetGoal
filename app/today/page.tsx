import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { addHours, formatISO, format } from 'date-fns'
import { redirect } from 'next/navigation'
import { TodayTasks } from '@/components/today-tasks'

export default async function TodayPage() {
  const demo = !hasSupabaseEnv()
  let user: any = null
  let workStartHour = 4
  let workDurationHours = 16
  
  if (!demo) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) redirect('/login')

    // Fetch user preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('work_start_hour, work_duration_hours')
      .eq('user_id', user.id)
      .single()
    
    if (prefs) {
      workStartHour = prefs.work_start_hour
      workDurationHours = prefs.work_duration_hours
    }
  }

  // Calculate work window based on user preferences
  const now = new Date()
  const dayStart = new Date(now)
  dayStart.setHours(workStartHour, 0, 0, 0)
  
  // If current time is before work start, use previous day's window
  if (now.getHours() < workStartHour) {
    dayStart.setDate(dayStart.getDate() - 1)
  }
  
  const dayEnd = addHours(dayStart, workDurationHours)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Today - {format(dayStart, 'PPPP')}</h1>
        {!demo && (
          <a href="/settings" className="btn bg-slate-700 hover:bg-slate-600 text-sm">
            ⚙️ Settings
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card">
          <TodayTasks startIso={formatISO(dayStart)} endIso={formatISO(dayEnd)} />
        </div>
        <aside className="card">
          <h2 className="font-semibold mb-2">{workDurationHours}-hour Window</h2>
          <p className="text-sm text-slate-300">{format(dayStart, 'p')} - {format(dayEnd, 'p')}</p>
          <p className="mt-2 text-sm text-slate-400">{demo ? 'Demo mode: local-only tasks.' : 'Log tasks in your day.'}</p>
        </aside>
      </div>
    </div>
  )
}

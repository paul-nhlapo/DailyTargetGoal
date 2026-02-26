import { createClient } from '@/lib/supabase/server'
import { hasSupabaseEnv } from '@/lib/env'
import { formatISO } from 'date-fns'
import { redirect } from 'next/navigation'
import { TodayTasks } from '@/components/today-tasks'
import { DEFAULT_TIME_ZONE_NAME, formatDateLong, formatTimeShort, getWindowBounds } from '@/lib/timezone'

export default async function TodayPage() {
  const demo = !hasSupabaseEnv()
  let user: any = null
  let workStartHour = 4
  let workDurationHours = 16
  let timeZone = DEFAULT_TIME_ZONE_NAME
  
  if (!demo) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) redirect('/login')

    // Fetch user preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('work_start_hour, work_duration_hours, time_zone')
      .eq('user_id', user.id)
      .single()
    
    if (prefs) {
      workStartHour = prefs.work_start_hour
      workDurationHours = prefs.work_duration_hours
      timeZone = prefs.time_zone || DEFAULT_TIME_ZONE_NAME
    }
  }

  // Calculate work window based on user preferences and time zone
  const now = new Date()
  const { start: dayStart, end: dayEnd } = getWindowBounds(now, timeZone, workStartHour, workDurationHours)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Today - {formatDateLong(dayStart, timeZone)}</h1>
        {!demo && (
          <a href="/settings" className="btn bg-slate-700 hover:bg-slate-600 text-sm">
            ⚙️ Settings
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card">
          <TodayTasks startIso={formatISO(dayStart)} endIso={formatISO(dayEnd)} timeZone={timeZone} />
        </div>
        <aside className="card">
          <h2 className="font-semibold mb-2">{workDurationHours}-hour Window</h2>
          <p className="text-sm text-slate-300">{formatTimeShort(dayStart, timeZone)} - {formatTimeShort(dayEnd, timeZone)}</p>
          <p className="mt-2 text-sm text-slate-400">{demo ? 'Demo mode: local-only tasks.' : 'Log tasks in your day.'}</p>
        </aside>
      </div>
    </div>
  )
}

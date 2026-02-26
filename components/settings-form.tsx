"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SettingsForm({ 
  workStartHour, 
  workDurationHours,
  timeZone,
}: { 
  workStartHour: number
  workDurationHours: number
  timeZone: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [startHour, setStartHour] = useState(workStartHour)
  const [duration, setDuration] = useState(workDurationHours)
  const [tz, setTz] = useState(timeZone)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_preferences')
      .update({
        work_start_hour: startHour,
        work_duration_hours: duration,
        time_zone: tz
      })
      .eq('user_id', user.id)

    setSaving(false)

    if (error) {
      setMessage('❌ Error saving settings')
    } else {
      setMessage('✅ Settings saved! Redirecting...')
      setTimeout(() => router.push('/today'), 1500)
    }
  }

  const endHour = (startHour + duration) % 24
  const endsNextDay = startHour + duration >= 24

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Work Start Time
        </label>
        <select
          value={startHour}
          onChange={(e) => setStartHour(Number(e.target.value))}
          className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {i === 0 ? '12 AM (Midnight)' : i < 12 ? `${i} AM` : i === 12 ? '12 PM (Noon)' : `${i - 12} PM`}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">When does your productive day typically start?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Work Duration (hours)
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {Array.from({ length: 17 }, (_, i) => i + 8).map((hours) => (
            <option key={hours} value={hours}>
              {hours} hours
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">How many hours can you realistically work per day?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Time Zone
        </label>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</option>
          <option value="UTC">UTC</option>
          <option value="Europe/London">Europe/London</option>
          <option value="America/New_York">America/New_York</option>
        </select>
        <p className="text-xs text-slate-400 mt-1">Used to calculate your daily window and analytics.</p>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="text-sm text-slate-300">
          <strong>Your Work Window:</strong>
        </div>
        <div className="text-2xl font-bold text-purple-300 mt-2">
          {startHour === 0 ? '12 AM' : startHour < 12 ? `${startHour} AM` : startHour === 12 ? '12 PM' : `${startHour - 12} PM`}
          {' → '}
          {endHour === 0 ? '12 AM' : endHour < 12 ? `${endHour} AM` : endHour === 12 ? '12 PM' : `${endHour - 12} PM`}
          {endsNextDay && <span className="text-sm text-amber-400 ml-2">(next day)</span>}
        </div>
        <div className="text-sm text-slate-400 mt-1">
          {duration} hours of focused productivity time
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn bg-purple-600 hover:bg-purple-500 flex-1 disabled:opacity-50"
        >
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/today')}
          className="btn bg-slate-700 hover:bg-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  
  if (!data.user) redirect('/login')

  // Fetch or create user preferences
  let { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  // Create default preferences if none exist
  if (!prefs) {
    const { data: newPrefs } = await supabase
      .from('user_preferences')
      .insert({ 
        user_id: data.user.id,
        work_start_hour: 4,
        work_duration_hours: 16,
        time_zone: 'Africa/Johannesburg'
      })
      .select()
      .single()
    prefs = newPrefs
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-slate-400">Configure your daily work window</p>
      </div>

      <div className="card">
        <SettingsForm 
          workStartHour={prefs?.work_start_hour || 4}
          workDurationHours={prefs?.work_duration_hours || 16}
          timeZone={prefs?.time_zone || 'Africa/Johannesburg'}
        />
      </div>

      <div className="mt-6 card bg-blue-900/20 border-blue-500">
        <h3 className="font-semibold mb-2">💡 Tips for Setting Your Work Window</h3>
        <ul className="text-sm text-slate-300 space-y-2">
          <li>• <strong>Start Time:</strong> When do you typically begin productive work?</li>
          <li>• <strong>Duration:</strong> How many hours can you realistically focus per day?</li>
          <li>• <strong>Common setups:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-slate-400">
              <li>- Early bird: 5 AM - 9 PM (16 hours)</li>
              <li>- Standard: 8 AM - 10 PM (14 hours)</li>
              <li>- Night owl: 10 AM - 2 AM (16 hours)</li>
              <li>- Focused: 9 AM - 6 PM (9 hours)</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )
}

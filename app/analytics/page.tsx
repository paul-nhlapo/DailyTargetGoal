import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { hasSupabaseEnv } from '@/lib/env'
import { AnalyticsView } from '@/components/analytics-view'

export default async function AnalyticsPage() {
  const demo = !hasSupabaseEnv()
  let user: any = null
  
  if (!demo) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) redirect('/login')
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">📊 Time Analytics</h1>
      <AnalyticsView />
    </div>
  )
}

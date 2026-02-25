"use client"

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { differenceInMinutes, startOfWeek, startOfMonth, endOfWeek, endOfMonth, format, parseISO } from 'date-fns'
import { hasSupabaseEnv } from '@/lib/env'

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other']

export function AnalyticsView() {
  const demo = typeof window !== 'undefined' ? !hasSupabaseEnv() : false
  const supabase = useMemo(() => createClient(), [])
  const [tasks, setTasks] = useState<any[]>([])
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    setLoading(true)
    if (demo) {
      const raw = localStorage.getItem('dtg_tasks')
      setTasks(raw ? JSON.parse(raw) : [])
      setLoading(false)
      return
    }
    const { data } = await supabase.from('tasks').select('*')
    setTasks(data || [])
    setLoading(false)
  }

  const analytics = useMemo(() => {
    const now = new Date()
    const periodStart = period === 'week' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfMonth(now)
    const periodEnd = period === 'week' ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now)

    const completedTasks = tasks.filter(t => 
      t.completed && 
      t.start_time && 
      t.end_time &&
      parseISO(t.completed_at) >= periodStart &&
      parseISO(t.completed_at) <= periodEnd
    )

    const totalMinutes = completedTasks.reduce((acc, t) => 
      acc + differenceInMinutes(parseISO(t.end_time), parseISO(t.start_time)), 0
    )

    const byCategory = CATEGORIES.map(cat => {
      const catTasks = completedTasks.filter(t => (t.category || 'Other') === cat)
      const minutes = catTasks.reduce((acc, t) => 
        acc + differenceInMinutes(parseISO(t.end_time), parseISO(t.start_time)), 0
      )
      return { category: cat, minutes, tasks: catTasks.length, percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0 }
    }).filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes)

    const days = period === 'week' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const avgPerDay = totalMinutes / days

    return { totalMinutes, byCategory, avgPerDay, completedTasks: completedTasks.length }
  }, [tasks, period])

  if (loading) return <div className="text-slate-400">Loading analytics...</div>

  return (
    <div className="grid gap-6">
      <div className="flex gap-2">
        <button 
          className={`btn ${period === 'week' ? 'bg-purple-600' : 'bg-slate-700'}`}
          onClick={() => setPeriod('week')}
        >
          This Week
        </button>
        <button 
          className={`btn ${period === 'month' ? 'bg-purple-600' : 'bg-slate-700'}`}
          onClick={() => setPeriod('month')}
        >
          This Month
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500">
          <div className="text-sm text-slate-400">Total Time Used</div>
          <div className="text-3xl font-bold text-blue-300">
            {Math.floor(analytics.totalMinutes / 60)}h {analytics.totalMinutes % 60}m
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500">
          <div className="text-sm text-slate-400">Avg Per Day</div>
          <div className="text-3xl font-bold text-green-300">
            {Math.floor(analytics.avgPerDay / 60)}h {Math.round(analytics.avgPerDay % 60)}m
          </div>
        </div>
        <div className="card bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-500">
          <div className="text-sm text-slate-400">Tasks Completed</div>
          <div className="text-3xl font-bold text-amber-300">
            {analytics.completedTasks}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Time by Category</h2>
        {analytics.byCategory.length === 0 ? (
          <p className="text-slate-400">No completed tasks in this period</p>
        ) : (
          <div className="space-y-4">
            {analytics.byCategory.map(cat => (
              <div key={cat.category}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-slate-400">
                    {Math.floor(cat.minutes / 60)}h {cat.minutes % 60}m ({cat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{cat.tasks} tasks</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">📈 Insights</h2>
        <div className="space-y-3 text-sm">
          {analytics.totalMinutes > 0 ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>You've utilized <strong>{((analytics.totalMinutes / (period === 'week' ? 7 * 16 * 60 : 30 * 16 * 60)) * 100).toFixed(1)}%</strong> of your available {period === 'week' ? 'weekly' : 'monthly'} time window</span>
              </div>
              {analytics.byCategory[0] && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">📊</span>
                  <span>Most time spent on <strong>{analytics.byCategory[0].category}</strong> ({analytics.byCategory[0].percentage.toFixed(1)}%)</span>
                </div>
              )}
              {analytics.avgPerDay < 8 * 60 && (
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">💡</span>
                  <span>You're averaging {Math.floor(analytics.avgPerDay / 60)}h per day. Consider scheduling more tasks to maximize productivity!</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-400">Complete some tasks to see insights!</div>
          )}
        </div>
      </div>
    </div>
  )
}

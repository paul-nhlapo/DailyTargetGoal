"use client"

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addDays, differenceInMinutes, endOfDay, endOfMonth, endOfWeek, format, isSameDay, parseISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { hasSupabaseEnv } from '@/lib/env'

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other']

type Period = 'today' | 'week' | 'month'

type Task = {
  completed?: boolean
  completed_at?: string | null
  start_time?: string | null
  end_time?: string | null
  category?: string | null
  window_date?: string | null
}

function getTaskDate(task: Task) {
  if (task.window_date) return parseISO(task.window_date)
  if (task.completed_at) return parseISO(task.completed_at)
  return null
}

function summarize(tasks: Task[]) {
  const totalMinutes = tasks.reduce((acc, t) => {
    if (!t.start_time || !t.end_time) return acc
    return acc + differenceInMinutes(parseISO(t.end_time), parseISO(t.start_time))
  }, 0)

  const byCategory = CATEGORIES.map(cat => {
    const catTasks = tasks.filter(t => (t.category || 'Other') === cat)
    const minutes = catTasks.reduce((acc, t) => {
      if (!t.start_time || !t.end_time) return acc
      return acc + differenceInMinutes(parseISO(t.end_time), parseISO(t.start_time))
    }, 0)
    return { category: cat, minutes, tasks: catTasks.length, percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0 }
  }).filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes)

  return { totalMinutes, byCategory, completedTasks: tasks.length }
}

export function AnalyticsView() {
  const demo = typeof window !== 'undefined' ? !hasSupabaseEnv() : false
  const supabase = useMemo(() => createClient(), [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [period, setPeriod] = useState<Period>('today')
  const [compact, setCompact] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null)
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
    setTasks((data || []) as Task[])
    setLoading(false)
  }

  const { periodStart, periodEnd } = useMemo(() => {
    const now = new Date()
    if (period === 'today') {
      return { periodStart: startOfDay(now), periodEnd: endOfDay(now) }
    }
    if (period === 'week') {
      return { periodStart: startOfWeek(now, { weekStartsOn: 1 }), periodEnd: endOfWeek(now, { weekStartsOn: 1 }) }
    }
    return { periodStart: startOfMonth(now), periodEnd: endOfMonth(now) }
  }, [period])

  const completedTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.completed || !t.start_time || !t.end_time || !t.completed_at) return false
      const completedAt = parseISO(t.completed_at)
      return completedAt >= periodStart && completedAt <= periodEnd
    })
  }, [tasks, periodStart, periodEnd])

  const analytics = useMemo(() => summarize(completedTasks), [completedTasks])

  const detailedWeek = useMemo(() => {
    if (period !== 'week') return [] as { date: Date, totalMinutes: number, completed: number }[]
    const days: { date: Date, totalMinutes: number, completed: number }[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(periodStart, i)
      const dayTasks = completedTasks.filter(t => {
        const taskDate = getTaskDate(t)
        return taskDate ? isSameDay(taskDate, date) : false
      })
      const summary = summarize(dayTasks)
      days.push({ date, totalMinutes: summary.totalMinutes, completed: summary.completedTasks })
    }
    return days
  }, [completedTasks, period, periodStart])

  const detailedMonth = useMemo(() => {
    if (period !== 'month') return [] as { start: Date, end: Date, totalMinutes: number, completed: number }[]
    const weeks: { start: Date, end: Date, totalMinutes: number, completed: number }[] = []
    let cursor = startOfWeek(periodStart, { weekStartsOn: 1 })
    while (cursor <= periodEnd) {
      const weekStart = cursor
      const weekEnd = addDays(weekStart, 6)
      const weekTasks = completedTasks.filter(t => {
        const taskDate = getTaskDate(t)
        return taskDate ? taskDate >= weekStart && taskDate <= weekEnd : false
      })
      const summary = summarize(weekTasks)
      weeks.push({ start: weekStart, end: weekEnd, totalMinutes: summary.totalMinutes, completed: summary.completedTasks })
      cursor = addDays(cursor, 7)
    }
    return weeks
  }, [completedTasks, period, periodStart, periodEnd])

  const selectedDetailTasks = useMemo(() => {
    if (period === 'week' && selectedDay) {
      return completedTasks.filter(t => {
        const taskDate = getTaskDate(t)
        return taskDate ? isSameDay(taskDate, selectedDay) : false
      })
    }
    if (period === 'month' && selectedWeekStart) {
      const weekStart = selectedWeekStart
      const weekEnd = addDays(weekStart, 6)
      return completedTasks.filter(t => {
        const taskDate = getTaskDate(t)
        return taskDate ? taskDate >= weekStart && taskDate <= weekEnd : false
      })
    }
    return []
  }, [completedTasks, period, selectedDay, selectedWeekStart])

  const selectedSummary = useMemo(() => summarize(selectedDetailTasks), [selectedDetailTasks])

  const daysInPeriod = useMemo(() => {
    if (period === 'today') return 1
    if (period === 'week') return 7
    return new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate()
  }, [period, periodStart])

  const avgPerDay = analytics.totalMinutes / daysInPeriod

  if (loading) return <div className="text-slate-400">Loading analytics...</div>

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2 items-center">
        <button 
          className={`btn ${period === 'today' ? 'bg-purple-600' : 'bg-slate-700'}`}
          onClick={() => {
            setPeriod('today')
            setSelectedDay(null)
            setSelectedWeekStart(null)
          }}
        >
          Today
        </button>
        <button 
          className={`btn ${period === 'week' ? 'bg-purple-600' : 'bg-slate-700'}`}
          onClick={() => {
            setPeriod('week')
            setSelectedDay(null)
            setSelectedWeekStart(null)
          }}
        >
          This Week
        </button>
        <button 
          className={`btn ${period === 'month' ? 'bg-purple-600' : 'bg-slate-700'}`}
          onClick={() => {
            setPeriod('month')
            setSelectedDay(null)
            setSelectedWeekStart(null)
          }}
        >
          This Month
        </button>
        <button
          className={`btn ${compact ? 'bg-slate-700' : 'bg-purple-600'}`}
          onClick={() => setCompact(prev => !prev)}
        >
          {compact ? 'Detailed View' : 'Compact View'}
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
            {Math.floor(avgPerDay / 60)}h {Math.round(avgPerDay % 60)}m
          </div>
        </div>
        <div className="card bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-500">
          <div className="text-sm text-slate-400">Tasks Completed</div>
          <div className="text-3xl font-bold text-amber-300">
            {analytics.completedTasks}
          </div>
        </div>
      </div>

      {period === 'week' && !compact && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Daily Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {detailedWeek.map(day => (
              <button
                key={day.date.toISOString()}
                onClick={() => setSelectedDay(day.date)}
                className={`text-left bg-slate-800/50 rounded p-3 border ${
                  selectedDay && isSameDay(day.date, selectedDay) ? 'border-purple-500' : 'border-transparent'
                } hover:border-purple-400`}
              >
                <div className="text-sm text-slate-400">{format(day.date, 'PPPP')}</div>
                <div className="text-lg font-semibold text-slate-200">
                  {Math.floor(day.totalMinutes / 60)}h {day.totalMinutes % 60}m
                </div>
                <div className="text-xs text-slate-400">{day.completed} completed</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {period === 'month' && !compact && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Weekly Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {detailedMonth.map(week => (
              <button
                key={week.start.toISOString()}
                onClick={() => setSelectedWeekStart(week.start)}
                className={`text-left bg-slate-800/50 rounded p-3 border ${
                  selectedWeekStart && week.start.getTime() === selectedWeekStart.getTime() ? 'border-purple-500' : 'border-transparent'
                } hover:border-purple-400`}
              >
                <div className="text-sm text-slate-400">
                  {format(week.start, 'MMM d')} - {format(week.end, 'MMM d')}
                </div>
                <div className="text-lg font-semibold text-slate-200">
                  {Math.floor(week.totalMinutes / 60)}h {week.totalMinutes % 60}m
                </div>
                <div className="text-xs text-slate-400">{week.completed} completed</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!compact && (selectedDay || selectedWeekStart) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {period === 'week' && selectedDay && `Insights for ${format(selectedDay, 'PPPP')}`}
            {period === 'month' && selectedWeekStart && `Insights for week of ${format(selectedWeekStart, 'MMM d')}`}
          </h2>
          {selectedSummary.completedTasks === 0 ? (
            <div className="text-slate-400">No completed tasks for this selection.</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-sm text-slate-400">Total Time Used</div>
                <div className="text-2xl font-semibold text-slate-200">
                  {Math.floor(selectedSummary.totalMinutes / 60)}h {selectedSummary.totalMinutes % 60}m
                </div>
              </div>
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-sm text-slate-400">Tasks Completed</div>
                <div className="text-2xl font-semibold text-slate-200">{selectedSummary.completedTasks}</div>
              </div>
              <div className="bg-slate-800/50 rounded p-3">
                <div className="text-sm text-slate-400">Top Category</div>
                <div className="text-2xl font-semibold text-slate-200">
                  {selectedSummary.byCategory[0]?.category || '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
        <h2 className="text-xl font-semibold mb-4">Insights</h2>
        <div className="space-y-3 text-sm">
          {analytics.totalMinutes > 0 ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-green-400">?</span>
                <span>You've utilized <strong>{((analytics.totalMinutes / (daysInPeriod * 16 * 60)) * 100).toFixed(1)}%</strong> of your available time window</span>
              </div>
              {analytics.byCategory[0] && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">??</span>
                  <span>Most time spent on <strong>{analytics.byCategory[0].category}</strong> ({analytics.byCategory[0].percentage.toFixed(1)}%)</span>
                </div>
              )}
              {avgPerDay < 8 * 60 && (
                <div className="flex items-start gap-2">
                  <span className="text-amber-400">??</span>
                  <span>You're averaging {Math.floor(avgPerDay / 60)}h per day. Consider scheduling more tasks to maximize productivity!</span>
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

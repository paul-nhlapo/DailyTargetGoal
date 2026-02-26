"use client"

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addDays, addMinutes, differenceInMinutes, endOfWeek, format, isWithinInterval, parseISO, areIntervalsOverlapping, startOfWeek } from 'date-fns'
import { z } from 'zod'
import { hasSupabaseEnv } from '@/lib/env'
import { getDailyReward, getStreakBonus, getMotivationalTip } from '@/lib/rewards'
import { requestNotificationPermission, scheduleTaskNotification } from '@/lib/notifications'

const Task = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  notes: z.string().nullable(),
  category: z.string().nullable().optional(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  completed: z.boolean(),
  completed_at: z.string().nullable(),
  window_date: z.string(),
  original_window_date: z.string(),
  deferred_to_date: z.string().nullable(),
  archived_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  })
export type Task = z.infer<typeof Task>

export function TodayTasks({ startIso, endIso }: { startIso: string, endIso: string }) {
  const demo = typeof window !== 'undefined' ? !hasSupabaseEnv() : false
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [showReward, setShowReward] = useState(false)
  const [rewardDeals, setRewardDeals] = useState<any[]>([])
  const [editingTime, setEditingTime] = useState<string | null>(null)
  const [timeStart, setTimeStart] = useState('')
  const [timeDuration, setTimeDuration] = useState('30')
  const [taskCategory, setTaskCategory] = useState('Other')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activePomodoro, setActivePomodoro] = useState<string | null>(null)
  const [pomodoroTime, setPomodoroTime] = useState(0)
  const [activeCountdownTaskId, setActiveCountdownTaskId] = useState<string | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [interferences, setInterferences] = useState<{id: string, start: string, end?: string, reason: string}[]>([])
  const [activeInterference, setActiveInterference] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const notificationTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const windowRefreshTriggered = useRef(false)

  const start = parseISO(startIso)
  const end = parseISO(endIso)
  const windowDate = format(start, 'yyyy-MM-dd')
  const nextWindowStart = addDays(start, 1)
  const nextWindowDate = format(nextWindowStart, 'yyyy-MM-dd')
  const weekStart = startOfWeek(start, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(start, { weekStartsOn: 1 })
  const weekStartDate = format(weekStart, 'yyyy-MM-dd')
  const weekEndDate = format(weekEnd, 'yyyy-MM-dd')
  const windowClosed = currentTime >= end

  function normalizeTask(raw: any): Task {
    const createdAt = raw.created_at ? parseISO(raw.created_at) : start
    const fallbackDate = format(createdAt, 'yyyy-MM-dd')
    return {
      id: raw.id,
      user_id: raw.user_id,
      title: raw.title,
      notes: raw.notes ?? null,
      category: raw.category ?? 'Other',
      start_time: raw.start_time ?? null,
      end_time: raw.end_time ?? null,
      completed: Boolean(raw.completed),
      completed_at: raw.completed_at ?? null,
      window_date: raw.window_date ?? fallbackDate,
      original_window_date: raw.original_window_date ?? raw.window_date ?? fallbackDate,
      deferred_to_date: raw.deferred_to_date ?? null,
      archived_at: raw.archived_at ?? null,
      created_at: raw.created_at ?? createdAt.toISOString(),
      updated_at: raw.updated_at ?? createdAt.toISOString(),
    }
  }

  function formatWindowDate(dateStr: string) {
    return format(parseISO(dateStr), 'PPPP')
  }

  async function load() {
    setLoading(true)
    if (demo) {
      const raw = localStorage.getItem('dtg_tasks')
      const list = raw ? JSON.parse(raw) as Task[] : []
      const normalized = list.map(t => normalizeTask(t))
      setTasks(normalized)
      localStorage.setItem('dtg_tasks', JSON.stringify(normalized))
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('window_date', weekStartDate)
      .lte('window_date', weekEndDate)
      .order('start_time', { ascending: true, nullsFirst: true })
    if (!error && data) setTasks(data.map(t => normalizeTask(t)) as Task[])
    setLoading(false)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (windowClosed) return
    if (!title.trim()) return
    if (demo) {
      const t: Task = {
        id: crypto.randomUUID(),
        user_id: 'demo-user',
        title,
        notes: null,
        category: taskCategory,
        start_time: null,
        end_time: null,
        completed: false,
        completed_at: null,
        window_date: windowDate,
        original_window_date: windowDate,
        deferred_to_date: null,
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        }
      const list = [t, ...tasks]
      setTasks(list)
      localStorage.setItem('dtg_tasks', JSON.stringify(list))
      setTitle('')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in to add tasks')
      return
    }
    const { data, error } = await supabase
      .from('tasks')
      .insert({ 
        title, 
        category: taskCategory, 
        user_id: user.id, 
        window_date: windowDate,
        original_window_date: windowDate,
      })
      .select('*')
      .single()
    if (error) {
      console.error('Error adding task:', error)
      alert('Error adding task: ' + error.message)
      return
    }
    if (data) setTasks(prev => [data as Task, ...prev])
    setTitle('')
  }

  async function updateTask(tid: string, patch: Partial<Task>) {
    if (demo) {
      const updated = tasks.map(t => t.id === tid ? { ...t, ...patch, updated_at: new Date().toISOString() } as Task : t)
      setTasks(updated)
      localStorage.setItem('dtg_tasks', JSON.stringify(updated))
      return
    }
    const { data, error } = await supabase.from('tasks').update(patch).eq('id', tid).select('*').single()
    if (!error && data) setTasks(prev => prev.map(t => t.id === tid ? data as Task : t))
  }

  async function deferTaskToTomorrow(t: Task) {
    const patch: Partial<Task> = {
      window_date: nextWindowDate,
      deferred_to_date: nextWindowDate,
      original_window_date: t.original_window_date || t.window_date,
      start_time: null,
      end_time: null,
      completed: false,
      completed_at: null,
      archived_at: null,
    }
    await updateTask(t.id, patch)
  }

  // Auto-Ripple: Shift all subsequent tasks when one overruns
  function autoRipple(changedTask: Task, newEndTime: Date) {
    const sortedTasks = tasks
      .filter(t => t.start_time && t.end_time && !t.completed)
      .sort((a, b) => parseISO(a.start_time!).getTime() - parseISO(b.start_time!).getTime())
    
    const changedIndex = sortedTasks.findIndex(t => t.id === changedTask.id)
    if (changedIndex === -1) return

    const overrun = differenceInMinutes(newEndTime, parseISO(changedTask.end_time!))
    if (overrun <= 0) return

    // Shift all subsequent tasks
    for (let i = changedIndex + 1; i < sortedTasks.length; i++) {
      const task = sortedTasks[i]
      const newStart = addMinutes(parseISO(task.start_time!), overrun)
      const newEnd = addMinutes(parseISO(task.end_time!), overrun)
      updateTask(task.id, { 
        start_time: clampToWindow(newStart).toISOString(), 
        end_time: clampToWindow(newEnd).toISOString() 
      })
    }
  }

  // Interference tracking
  function startInterference() {
    const id = crypto.randomUUID()
    const newInterference = { id, start: new Date().toISOString(), reason: '' }
    setInterferences(prev => [...prev, newInterference])
    setActiveInterference(id)
  }

  function endInterference(reason: string) {
    if (!activeInterference) return
    setInterferences(prev => prev.map(i => 
      i.id === activeInterference ? { ...i, end: new Date().toISOString(), reason } : i
    ))
    setActiveInterference(null)
  }

  async function removeTask(tid: string) {
    if (windowClosed) return
    const prev = tasks
    setTasks(prev => prev.filter(t => t.id !== tid))
    if (demo) {
      localStorage.setItem('dtg_tasks', JSON.stringify(prev.filter(t => t.id !== tid)))
      return
    }
    const { error } = await supabase.from('tasks').delete().eq('id', tid)
    if (error) setTasks(prev)
  }

  useEffect(() => { load() }, [windowDate, weekStartDate, weekEndDate])

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      setNotificationsEnabled(granted)
    })
  }, [])

  // Schedule notifications for tasks
  useEffect(() => {
    // Clear existing timers
    notificationTimers.current.forEach(timer => clearTimeout(timer))
    notificationTimers.current.clear()
    if (!notificationsEnabled || windowClosed) return

    // Schedule notifications for upcoming tasks
    tasks
      .filter(task => task.window_date === windowDate && !task.archived_at)
      .forEach(task => {
      if (task.start_time && !task.completed) {
        const startTime = parseISO(task.start_time)
        
        // Schedule 5 min before
        const timer5 = scheduleTaskNotification(task.title, startTime, 5)
        if (timer5) notificationTimers.current.set(`${task.id}-5`, timer5)
        
        // Schedule at start time
        const timer0 = scheduleTaskNotification(task.title, startTime, 0)
        if (timer0) notificationTimers.current.set(`${task.id}-0`, timer0)
      }
    })

    return () => {
      notificationTimers.current.forEach(timer => clearTimeout(timer))
      notificationTimers.current.clear()
    }
  }, [tasks, notificationsEnabled, windowClosed, windowDate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (activePomodoro) {
        setPomodoroTime(prev => {
          if (prev <= 0) {
            setActivePomodoro(null)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [activePomodoro])

  useEffect(() => {
    if (!activeCountdownTaskId) return
    const activeTask = tasks.find(t => t.id === activeCountdownTaskId)
    if (!activeTask || activeTask.completed || !activeTask.end_time) {
      setActiveCountdownTaskId(null)
      return
    }
    const endTime = parseISO(activeTask.end_time)
    if (currentTime >= endTime) {
      setActiveCountdownTaskId(null)
    }
  }, [activeCountdownTaskId, currentTime, tasks])

  useEffect(() => {
    if (currentTime >= nextWindowStart && !windowRefreshTriggered.current) {
      windowRefreshTriggered.current = true
      router.refresh()
    }
  }, [currentTime, nextWindowStart, router])

  useEffect(() => {
    windowRefreshTriggered.current = false
  }, [windowDate])

  useEffect(() => {
    if (!windowClosed) return
    const toArchive = tasks.filter(t => t.window_date === windowDate && t.completed && !t.archived_at)
    if (toArchive.length === 0) return

    if (demo) {
      const nowIso = new Date().toISOString()
      const updated = tasks.map(t => 
        t.window_date === windowDate && t.completed && !t.archived_at
          ? { ...t, archived_at: nowIso }
          : t
      )
      setTasks(updated)
      localStorage.setItem('dtg_tasks', JSON.stringify(updated))
      return
    }

    const ids = toArchive.map(t => t.id)
    supabase
      .from('tasks')
      .update({ archived_at: new Date().toISOString() })
      .in('id', ids)
      .select('*')
      .then(({ data, error }) => {
        if (error || !data) return
        const updatedById = new Map(data.map(d => [d.id, normalizeTask(d)]))
        setTasks(prev => prev.map(t => updatedById.get(t.id) || t))
      })
  }, [demo, supabase, tasks, windowClosed, windowDate])

  // Helpers
  function withinWindow(t: Task) {
    if (!t.start_time || !t.end_time) return true
    const s = parseISO(t.start_time)
    const e = parseISO(t.end_time)
    return isWithinInterval(s, { start, end }) || isWithinInterval(e, { start, end })
  }

  function clampToWindow(dt: Date) {
    if (dt < start) return start
    if (dt > end) return end
    return dt
  }

  function bump(t: Task, minutes: number) {
    if (windowClosed) return
    const s = t.start_time ? parseISO(t.start_time) : start
    const e = t.end_time ? parseISO(t.end_time) : addMinutes(s, 30)
    const duration = differenceInMinutes(e, s)
    const ns = clampToWindow(addMinutes(s, minutes))
    const ne = clampToWindow(addMinutes(ns, duration))
    updateTask(t.id, { start_time: ns.toISOString(), end_time: ne.toISOString() })
  }

  function setTime(t: Task) {
    if (windowClosed) return
    if (!t.start_time) {
      const now = new Date()
      const s = clampToWindow(now)
      const e = clampToWindow(addMinutes(s, 30))
      
      // Check for conflicts
      const hasConflict = tasks.some(other => {
        if (other.id === t.id || !other.start_time || !other.end_time) return false
        return areIntervalsOverlapping(
          { start: s, end: e },
          { start: parseISO(other.start_time), end: parseISO(other.end_time) }
        )
      })
      
      if (hasConflict) {
        alert('⚠️ Time conflict! This time overlaps with another task. Please adjust other tasks first.')
        return
      }
      
      updateTask(t.id, { start_time: s.toISOString(), end_time: e.toISOString() })
    }
  }

  function openTimeEditor(t: Task) {
    if (windowClosed) return
    setEditingTime(t.id)
    if (t.start_time) {
      const s = parseISO(t.start_time)
      setTimeStart(format(s, 'HH:mm'))
      setTimeDuration(String(differenceInMinutes(parseISO(t.end_time!), s)))
    } else {
      setTimeStart(format(new Date(), 'HH:mm'))
      setTimeDuration('30')
    }
  }

  function saveTime() {
    if (windowClosed) return
    if (!editingTime) return
    const [hours, minutes] = timeStart.split(':').map(Number)
    const today = new Date()
    today.setHours(hours, minutes, 0, 0)
    
    const s = clampToWindow(today)
    const e = clampToWindow(addMinutes(s, parseInt(timeDuration)))
    
    // Check for conflicts
    const hasConflict = tasks.some(other => {
      if (other.id === editingTime || !other.start_time || !other.end_time) return false
      return areIntervalsOverlapping(
        { start: s, end: e },
        { start: parseISO(other.start_time), end: parseISO(other.end_time) }
      )
    })
    
    if (hasConflict) {
      alert('⚠️ Time conflict! This time overlaps with another task.')
      return
    }
    
    updateTask(editingTime, { start_time: s.toISOString(), end_time: e.toISOString() })
    setEditingTime(null)
  }

  function toggleComplete(t: Task) {
    if (windowClosed) return
    // Check if task has time set
    if (!t.start_time || !t.end_time) {
      alert('⚠️ Please set a time for this task before marking it complete!')
      return
    }
    
    // Check if current time is within or after task time
    const taskStart = parseISO(t.start_time)
    const taskEnd = parseISO(t.end_time)
    
    if (!t.completed && currentTime < taskStart) {
      alert(`⏰ You can only complete this task after ${format(taskStart, 'p')}!\n\nStay focused on your schedule! 💪`)
      return
    }
    
    if (!t.completed) {
      // Fetch real scraped deals
      fetch('/api/deals')
        .then(res => res.json())
        .then(data => {
          setRewardDeals(data.deals || [])
          setShowReward(true)
        })
        .catch(() => {
          setRewardDeals([])
          setShowReward(true)
        })
    }
    updateTask(t.id, { 
      completed: !t.completed, 
      completed_at: !t.completed ? new Date().toISOString() : null 
    })
  }

  function startPomodoro(t: Task) {
    if (windowClosed) return
    if (!t.start_time || !t.end_time) return
    const duration = differenceInMinutes(parseISO(t.end_time), parseISO(t.start_time))
    setActivePomodoro(t.id)
    setPomodoroTime(duration * 60)
    setFocusMode(true)
  }

  function startTaskCountdown(t: Task) {
    if (windowClosed) return
    if (!t.start_time || !t.end_time || t.completed) return
    setActiveCountdownTaskId(t.id)
  }

  function stopTaskCountdown() {
    setActiveCountdownTaskId(null)
  }

  // Get current task based on time
  const currentTask = useMemo(() => {
    const now = currentTime
    return tasks.find(t => {
      if (t.window_date !== windowDate) return false
      if (!t.start_time || !t.end_time || t.completed || t.archived_at) return false
      const start = parseISO(t.start_time)
      const end = parseISO(t.end_time)
      return now >= start && now <= end
    })
  }, [tasks, currentTime, windowDate])

  const activeCountdownTask = useMemo(() => {
    if (!activeCountdownTaskId) return null
    return tasks.find(t => t.id === activeCountdownTaskId) || null
  }, [tasks, activeCountdownTaskId])

  const activeCountdownSeconds = useMemo(() => {
    if (!activeCountdownTask || !activeCountdownTask.end_time) return 0
    const endTime = parseISO(activeCountdownTask.end_time)
    const remaining = Math.floor((endTime.getTime() - currentTime.getTime()) / 1000)
    return Math.max(0, remaining)
  }, [activeCountdownTask, currentTime])

  // Calculate total interference time
  const totalInterferenceMinutes = useMemo(() => {
    return interferences.reduce((acc, i) => {
      if (!i.end) return acc
      return acc + differenceInMinutes(parseISO(i.end), parseISO(i.start))
    }, 0)
  }, [interferences])

  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.window_date === windowDate && !t.archived_at)
  }, [tasks, windowDate])

  const activeTodayTasks = useMemo(() => {
    if (windowClosed) return todayTasks.filter(t => !t.completed)
    return todayTasks
  }, [todayTasks, windowClosed])

  const missedTodayTasks = useMemo(() => {
    if (!windowClosed) return []
    return todayTasks.filter(t => !t.completed)
  }, [todayTasks, windowClosed])

  const missedWeekTasks = useMemo(() => {
    return tasks.filter(t => 
      t.window_date >= weekStartDate &&
      t.window_date <= weekEndDate &&
      t.window_date < windowDate &&
      !t.completed
    )
  }, [tasks, weekStartDate, weekEndDate, windowDate])

  const historyTasks = useMemo(() => {
    return tasks.filter(t => 
      t.archived_at || (t.completed && t.window_date < windowDate)
    )
  }, [tasks, windowDate])

  // Focus Mode View
  if (focusMode && currentTask) {
    const taskEnd = parseISO(currentTask.end_time!)
    const remainingSeconds = Math.max(0, Math.floor((taskEnd.getTime() - currentTime.getTime()) / 1000))
    const remainingMinutes = Math.floor(remainingSeconds / 60)
    const remainingSecondsDisplay = remainingSeconds % 60

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-2xl px-6">
          <button 
            onClick={() => setFocusMode(false)}
            className="absolute top-4 right-4 btn bg-slate-700 hover:bg-slate-600 text-sm"
          >
            ✕ Exit Focus
          </button>
          
          <div className="mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-5xl font-bold text-white mb-4">{currentTask.title}</h1>
            <div className="text-xl text-purple-300">
              {format(parseISO(currentTask.start_time!), 'p')} – {format(parseISO(currentTask.end_time!), 'p')}
            </div>
          </div>

          <div className="bg-slate-900/50 border-4 border-purple-500 rounded-3xl p-12 mb-8">
            <div className="text-9xl font-bold text-purple-300 mb-4">
              {remainingMinutes}:{String(remainingSecondsDisplay).padStart(2, '0')}
            </div>
            <div className="text-2xl text-slate-400">Time Remaining</div>
          </div>

          <div className="flex gap-4 justify-center">
            {!activeInterference ? (
              <button 
                onClick={startInterference}
                className="btn bg-amber-600 hover:bg-amber-500 text-xl px-8 py-4"
              >
                ⏸️ Pause (Interference)
              </button>
            ) : (
              <button 
                onClick={() => {
                  const reason = prompt('What interrupted you?') || 'Unplanned break'
                  endInterference(reason)
                }}
                className="btn bg-green-600 hover:bg-green-500 text-xl px-8 py-4 animate-pulse"
              >
                ▶️ Resume
              </button>
            )}
            <button 
              onClick={() => toggleComplete(currentTask)}
              className="btn bg-green-600 hover:bg-green-500 text-xl px-8 py-4"
            >
              ✓ Complete Task
              </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {/* Focus Mode Toggle */}
      {currentTask && (
        <div className="card bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Current Task</div>
              <div className="text-xl font-bold text-purple-300">{currentTask.title}</div>
            </div>
            <button 
              onClick={() => setFocusMode(true)}
              className="btn bg-purple-600 hover:bg-purple-500 text-lg px-6 py-3"
            >
              🎯 Enter Focus Mode
            </button>
          </div>
        </div>
      )}

      {/* Window Countdown & Stats */}
      <div className="card bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-slate-400">16-Hour Window</div>
            <div className="text-2xl font-bold text-purple-300">
              {currentTime < end ? (
                <>
                  {Math.floor(differenceInMinutes(end, currentTime) / 60)}h {differenceInMinutes(end, currentTime) % 60}m remaining
                </>
              ) : (
                'Window Closed'
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                const granted = await requestNotificationPermission()
                setNotificationsEnabled(granted)
                if (!granted) {
                  alert('Please enable notifications in your browser settings to receive task reminders.')
                }
              }}
              className={`btn text-sm ${
                notificationsEnabled 
                  ? 'bg-green-600 hover:bg-green-500' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {notificationsEnabled ? '🔔 Notifications On' : '🔕 Enable Notifications'}
            </button>
            <div className="text-right">
              <div className="text-sm text-slate-400">Free Time</div>
              <div className="text-xl font-bold text-green-400">
                {(() => {
                  const scheduled = tasks.filter(t => t.start_time && t.end_time && !t.completed)
                    .filter(t => t.window_date === windowDate && !t.archived_at)
                    .reduce((acc, t) => acc + differenceInMinutes(parseISO(t.end_time!), parseISO(t.start_time!)), 0)
                  const total = differenceInMinutes(end, start)
                  const free = total - scheduled
                  return `${Math.floor(free / 60)}h ${free % 60}m`
                })()}
              </div>
            </div>
          </div>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
            style={{ width: `${Math.max(0, Math.min(100, (differenceInMinutes(currentTime, start) / differenceInMinutes(end, start)) * 100))}%` }}
          />
        </div>
      </div>

      {windowClosed && (
        <div className="card border-amber-500 bg-slate-900/60">
          <div className="text-sm text-amber-300 mb-1">Window closed</div>
          <div className="text-slate-300 text-sm">
            Editing is locked. You can defer incomplete tasks to tomorrow or leave them in your missed list.
          </div>
          <div className="text-slate-400 text-xs mt-2">
            Next window starts {format(nextWindowStart, 'PPPP p')}
          </div>
        </div>
      )}

      {/* Reality Audit - Interference Tracking */}
      {(interferences.length > 0 || activeInterference) && (
        <div className="card bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-500">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-400">Reality Audit</div>
              <div className="text-xl font-bold text-amber-300">
                {totalInterferenceMinutes}m lost to interruptions
              </div>
            </div>
            {!activeInterference ? (
              <button 
                onClick={startInterference}
                className="btn bg-amber-600 hover:bg-amber-500"
              >
                ⏸️ Log Interference
              </button>
            ) : (
              <button 
                onClick={() => {
                  const reason = prompt('What interrupted you?') || 'Unplanned break'
                  endInterference(reason)
                }}
                className="btn bg-green-600 hover:bg-green-500 animate-pulse"
              >
                ▶️ End Interference
              </button>
            )}
          </div>
          {interferences.filter(i => i.end).length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-400 hover:text-slate-300">View interference log ({interferences.filter(i => i.end).length})</summary>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {interferences.filter(i => i.end).map(i => (
                  <div key={i.id} className="text-slate-400 bg-slate-800/50 p-2 rounded">
                    <span className="text-amber-400">{differenceInMinutes(parseISO(i.end!), parseISO(i.start))}m</span> - {i.reason}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <form onSubmit={addTask} className="flex gap-2">
        <select 
          value={taskCategory} 
          onChange={e => setTaskCategory(e.target.value)}
          className="input w-32"
          disabled={windowClosed}
        >
          <option value="Work">💼 Work</option>
          <option value="Personal">🏠 Personal</option>
          <option value="Health">💪 Health</option>
          <option value="Learning">📚 Learning</option>
          <option value="Social">👥 Social</option>
          <option value="Other">📌 Other</option>
        </select>
        <input className="input" placeholder="New task title" value={title} onChange={e => setTitle(e.target.value)} disabled={windowClosed} />
        <button className="btn" type="submit" disabled={windowClosed}>Add</button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <>
          {!windowClosed && activeTodayTasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-2">No tasks yet. Add your first task above!</p>
              <p className="text-sm text-slate-500">Tip: After adding a task, click "Set Time" to schedule it.</p>
            </div>
          )}

          {activeTodayTasks.length > 0 && !windowClosed && (
            <>
              <div className="text-sm text-slate-400 mb-2">
                {todayTasks.filter(t => !t.completed).length} active | {todayTasks.filter(t => t.completed).length} completed
              </div>
              <ul className="grid gap-3">
                {activeTodayTasks.filter(withinWindow).sort((a, b) => {
                  if (a.completed !== b.completed) return a.completed ? 1 : -1
                  if (!a.start_time) return 1
                  if (!b.start_time) return -1
                  return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
                }).map(t => (
                  <li key={t.id} className={`card ${t.completed ? 'opacity-60 bg-slate-800/50' : ''}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => toggleComplete(t)}
                        disabled={windowClosed}
                        className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-green-600"
                      />
                      <div className="flex-1">
                        <div className={`font-medium text-lg ${t.completed ? 'line-through text-slate-500' : ''}`}>{t.title}</div>
                        {t.start_time && t.end_time ? (
                          <div className="text-sm text-green-400 mt-1">
                            {format(parseISO(t.start_time), 'p')} - {format(parseISO(t.end_time), 'p')} 
                            <span className="text-slate-400 ml-2">({differenceInMinutes(parseISO(t.end_time), parseISO(t.start_time))} min)</span>
                          </div>
                        ) : (
                          <div className="text-sm text-amber-400 mt-1">No time set</div>
                        )}
                        {t.end_time && (() => {
                          const remainingSeconds = activeCountdownTaskId === t.id
                            ? activeCountdownSeconds
                            : Math.max(0, Math.floor((parseISO(t.end_time).getTime() - currentTime.getTime()) / 1000))
                          const inProgress = t.start_time
                            ? currentTime >= parseISO(t.start_time) && currentTime <= parseISO(t.end_time)
                            : false
                          if (!inProgress && activeCountdownTaskId !== t.id) return null
                          return (
                            <div className="text-xs text-emerald-400 mt-1">
                              Remaining: {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                            </div>
                          )
                        })()}
                      </div>
                      {!windowClosed && (
                        <button className="btn bg-rose-600 hover:bg-rose-500 text-xs" onClick={() => removeTask(t.id)} type="button">Delete</button>
                      )}
                    </div>
                    
                    {!windowClosed && !t.completed && (
                      t.start_time && t.end_time ? (
                        <div className="space-y-2">
                          {activePomodoro === t.id && (
                            <div className="bg-purple-900/50 border border-purple-500 rounded p-3 text-center">
                              <div className="text-2xl font-bold text-purple-300">
                                {Math.floor(pomodoroTime / 60)}:{String(pomodoroTime % 60).padStart(2, '0')}
                              </div>
                              <div className="text-xs text-slate-400">Pomodoro Timer</div>
                              <button className="btn text-xs mt-2 bg-red-600" onClick={() => setActivePomodoro(null)} type="button">Stop</button>
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            {!activePomodoro && <button className="btn text-sm bg-purple-600 hover:bg-purple-500" onClick={() => startPomodoro(t)} type="button">Focus Mode</button>}
                            {activeCountdownTaskId === t.id ? (
                              <button className="btn text-sm bg-slate-700" onClick={stopTaskCountdown} type="button">Stop</button>
                            ) : (
                              <button className="btn text-sm bg-emerald-600 hover:bg-emerald-500" onClick={() => startTaskCountdown(t)} type="button">Start</button>
                            )}
                            <button className="btn text-sm" onClick={() => bump(t, -15)} type="button">-15m</button>
                            <button className="btn text-sm" onClick={() => bump(t, 15)} type="button">+15m</button>
                            <button 
                              className="btn text-sm bg-blue-600 hover:bg-blue-500" 
                              onClick={() => {
                                const newEnd = addMinutes(parseISO(t.end_time!), 15)
                                autoRipple(t, newEnd)
                                updateTask(t.id, { end_time: newEnd.toISOString() })
                              }} 
                              type="button"
                            >
                              +15m & Ripple
                            </button>
                            <button className="btn text-sm bg-purple-600 hover:bg-purple-500" onClick={() => openTimeEditor(t)} type="button">Edit Time</button>
                            <button className="btn text-sm bg-slate-700" onClick={() => updateTask(t.id, { start_time: null, end_time: null })} type="button">Clear Time</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button className="btn bg-green-600 hover:bg-green-500" onClick={() => setTime(t)} type="button">Quick Set (30 min)</button>
                          <button className="btn bg-purple-600 hover:bg-purple-500" onClick={() => openTimeEditor(t)} type="button">Custom Time</button>
                        </div>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {windowClosed && missedTodayTasks.length > 0 && (
            <div className="card border-amber-500 bg-slate-900/60">
              <div className="text-sm text-amber-300 mb-2">Missed tasks from {formatWindowDate(windowDate)}</div>
              <ul className="grid gap-2">
                {missedTodayTasks.map(t => (
                  <li key={t.id} className="flex items-center justify-between bg-slate-800/50 rounded p-3">
                    <div className="text-slate-200">
                      <div className="font-medium">{t.title}</div>
                      {t.start_time && t.end_time ? (
                        <div className="text-xs text-slate-400">
                          {format(parseISO(t.start_time), 'p')} - {format(parseISO(t.end_time), 'p')}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">No time set</div>
                      )}
                    </div>
                    <button className="btn text-xs bg-blue-600 hover:bg-blue-500" onClick={() => deferTaskToTomorrow(t)} type="button">
                      Defer to Tomorrow
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {missedWeekTasks.length > 0 && (
            <div className="card">
              <div className="text-sm text-slate-400 mb-2">Missed this week</div>
              <ul className="grid gap-2">
                {missedWeekTasks.map(t => (
                  <li key={t.id} className="flex items-center justify-between bg-slate-800/50 rounded p-3">
                    <div className="text-slate-200">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-slate-400">
                        Scheduled for {formatWindowDate(t.original_window_date || t.window_date)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {historyTasks.length > 0 && (
            <details className="card">
              <summary className="cursor-pointer text-slate-300">Past tasks</summary>
              <ul className="grid gap-2 mt-3">
                {historyTasks.map(t => (
                  <li key={t.id} className="flex items-center justify-between bg-slate-800/50 rounded p-3">
                    <div className="text-slate-200">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-slate-400">
                        {formatWindowDate(t.original_window_date || t.window_date)}
                      </div>
                    </div>
                    {t.start_time && t.end_time && (
                      <div className="text-xs text-slate-400">
                        {format(parseISO(t.start_time), 'p')} - {format(parseISO(t.end_time), 'p')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      {showReward && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowReward(false)}>
          <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            {(() => {
              const reward = getDailyReward()
              const completedToday = todayTasks.filter(t => t.completed).length
              const streak = getStreakBonus(completedToday)
              const tip = getMotivationalTip()
              
              return (
                <>
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{reward.emoji}</div>
                    <h2 className="text-xl font-bold text-green-400 mb-1">{reward.title}</h2>
                    <p className="text-sm text-slate-300 mb-2">{reward.message}</p>
                    <div className={`bg-gradient-to-r ${reward.color} border border-green-500/30 rounded-lg p-3 mb-3`}>
                      <p className="text-xs italic text-slate-200">"{reward.quote}"</p>
                    </div>
                  </div>
                  
                  {streak && (
                    <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-500 rounded-lg p-2 mb-3">
                      <div className="text-center">
                        <div className="text-sm font-bold text-orange-300">{streak.title}</div>
                        <div className="text-xs text-slate-300">{streak.message}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-400 mb-2 text-center">🎁 Your Rewards (Real Deals):</div>
                    <div className="space-y-2">
                      {rewardDeals.length > 0 ? (
                        rewardDeals.slice(0, 3).map((deal, i) => (
                          <a 
                            key={i}
                            href={deal.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 hover:border-green-500 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{deal.emoji}</span>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-green-400">{deal.store}</div>
                                <div className="text-xs text-slate-300">{deal.product || 'Special Deal'}</div>
                                <div className="text-xs text-amber-400">{deal.discount}</div>
                              </div>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 text-center p-2">Loading deals...</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-2 mb-3">
                    <p className="text-xs text-slate-300 text-center">{tip}</p>
                  </div>
                  
                  <button className="btn w-full bg-green-600 hover:bg-green-500 text-sm py-2" onClick={() => setShowReward(false)}>
                    Continue Crushing It! 💪
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {editingTime && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEditingTime(null)}>
          <div className="bg-slate-900 border-2 border-purple-500 rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">⏰ Set Task Time</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Time</label>
                <input 
                  type="time" 
                  value={timeStart} 
                  onChange={e => setTimeStart(e.target.value)}
                  className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-4 py-3 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                <select 
                  value={timeDuration} 
                  onChange={e => setTimeDuration(e.target.value)}
                  className="w-full rounded-md bg-slate-800 border-2 border-slate-700 px-4 py-3 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
              <div className="text-sm text-slate-400 bg-slate-800 p-3 rounded">
                📅 Task will run from <span className="text-green-400 font-semibold">{timeStart || '--:--'}</span> for <span className="text-green-400 font-semibold">{timeDuration} minutes</span>
              </div>
              <div className="flex gap-2">
                <button className="btn flex-1 bg-green-600 hover:bg-green-500 text-lg py-3" onClick={saveTime}>✓ Save Time</button>
                <button className="btn flex-1 bg-slate-700 hover:bg-slate-600 text-lg py-3" onClick={() => setEditingTime(null)}>✕ Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


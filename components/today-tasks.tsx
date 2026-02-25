"use client"

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addMinutes, differenceInMinutes, format, isWithinInterval, parseISO } from 'date-fns'
import { z } from 'zod'
import { hasSupabaseEnv } from '@/lib/env'

const Task = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  notes: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  })
export type Task = z.infer<typeof Task>

export function TodayTasks({ startIso, endIso }: { startIso: string, endIso: string }) {
  const demo = typeof window !== 'undefined' ? !hasSupabaseEnv() : false
  const supabase = useMemo(() => createClient(), [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const start = parseISO(startIso)
  const end = parseISO(endIso)

  async function load() {
    setLoading(true)
    if (demo) {
      const raw = localStorage.getItem('dtg_tasks')
      const list = raw ? JSON.parse(raw) as Task[] : []
      setTasks(list)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('start_time', { ascending: true, nullsFirst: true })
    if (!error && data) setTasks(data as Task[])
    setLoading(false)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (demo) {
      const t: Task = {
        id: crypto.randomUUID(),
        user_id: 'demo-user',
        title,
        notes: null,
        start_time: null,
        end_time: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        }
      const list = [t, ...tasks]
      setTasks(list)
      localStorage.setItem('dtg_tasks', JSON.stringify(list))
      setTitle('')
      return
    }
    const { data, error } = await supabase.from('tasks').insert({ title }).select('*').single()
    if (!error && data) setTasks(prev => [data as Task, ...prev])
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

  async function removeTask(tid: string) {
    const prev = tasks
    setTasks(prev => prev.filter(t => t.id !== tid))
    if (demo) {
      localStorage.setItem('dtg_tasks', JSON.stringify(prev.filter(t => t.id !== tid)))
      return
    }
    const { error } = await supabase.from('tasks').delete().eq('id', tid)
    if (error) setTasks(prev)
  }

  useEffect(() => { load() }, [])

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
    const s = t.start_time ? parseISO(t.start_time) : start
    const e = t.end_time ? parseISO(t.end_time) : addMinutes(s, 30)
    const duration = differenceInMinutes(e, s)
    const ns = clampToWindow(addMinutes(s, minutes))
    const ne = clampToWindow(addMinutes(ns, duration))
    updateTask(t.id, { start_time: ns.toISOString(), end_time: ne.toISOString() })
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={addTask} className="flex gap-2">
        <input className="input" placeholder="New task title" value={title} onChange={e => setTitle(e.target.value)} />
        <button className="btn" type="submit">Add</button>
      </form>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-slate-400">No tasks yet. Add one.</p>
      ) : (
        <ul className="grid gap-2">
          {tasks.filter(withinWindow).map(t => (
            <li key={t.id} className="card flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{t.title}</div>
                {t.start_time && t.end_time && (
                  <div className="text-xs text-slate-400">{format(parseISO(t.start_time), 'p')} – {format(parseISO(t.end_time), 'p')}</div>
                )}
                {t.notes && <div className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{t.notes}</div>}
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => bump(t, -15)} type="button">-15m</button>
                <button className="btn" onClick={() => bump(t, 15)} type="button">+15m</button>
                <button className="btn bg-rose-600 hover:bg-rose-500" onClick={() => removeTask(t.id)} type="button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

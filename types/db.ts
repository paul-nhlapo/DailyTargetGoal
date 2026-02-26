export type Tables = {
  tasks: {
    Row: {
      id: string
      user_id: string
      title: string
      notes: string | null
      category: string | null
      start_time: string | null
      end_time: string | null
      completed: boolean
      completed_at: string | null
      window_date: string
      original_window_date: string
      deferred_to_date: string | null
      archived_at: string | null
      created_at: string
      updated_at: string
    }
  }
  user_preferences: {
    Row: {
      id: string
      user_id: string
      work_start_hour: number
      work_duration_hours: number
      created_at: string
      updated_at: string
    }
  }
}

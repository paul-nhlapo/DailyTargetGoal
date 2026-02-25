export type Tables = {
  tasks: {
    Row: {
      id: string
      user_id: string
      title: string
      notes: string | null
      start_time: string | null
      end_time: string | null
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

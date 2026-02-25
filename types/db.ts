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
}

# Database Migration - Add Task Completion

If you already have the database set up, run this SQL in Supabase SQL Editor:

```sql
-- Add completed columns to existing tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
```

This adds:
- `completed` - Boolean flag for task completion
- `completed_at` - Timestamp when task was completed

## For New Setups

If you're setting up fresh, just run the main `supabase/schema.sql` file - it already includes these columns!

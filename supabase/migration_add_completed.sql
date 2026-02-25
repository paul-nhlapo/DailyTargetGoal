-- Add completed columns to existing tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;

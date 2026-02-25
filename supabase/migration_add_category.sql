-- Add category field to tasks for analytics
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other';

-- Common categories: Work, Personal, Health, Learning, Social, Other

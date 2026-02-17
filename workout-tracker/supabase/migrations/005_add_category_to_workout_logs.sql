-- Add category column to workout_logs
ALTER TABLE public.workout_logs
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'custom';

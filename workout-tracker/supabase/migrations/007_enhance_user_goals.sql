-- Enhance user_goals with target_date, current_progress, and priority
ALTER TABLE public.user_goals
    ADD COLUMN IF NOT EXISTS target_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS current_progress NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Update goal_type check to include more options
ALTER TABLE public.user_goals DROP CONSTRAINT IF EXISTS user_goals_goal_type_check;
ALTER TABLE public.user_goals ADD CONSTRAINT user_goals_goal_type_check
    CHECK (goal_type IN ('strength', 'endurance', 'weight_loss', 'muscle_gain', 'general_fitness', 'body_comp', 'performance', 'frequency'));

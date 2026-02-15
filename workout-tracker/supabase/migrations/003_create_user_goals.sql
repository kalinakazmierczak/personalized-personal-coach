CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('strength', 'endurance', 'weight_loss', 'muscle_gain', 'general_fitness')),
    target_description TEXT NOT NULL,
    target_value NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
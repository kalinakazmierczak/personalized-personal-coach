-- Users table policies
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (id = auth.uid());

-- Workout logs policies
CREATE POLICY "Users can view own workout logs"
ON public.workout_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own workout logs"
ON public.workout_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workout logs"
ON public.workout_logs FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own workout logs"
ON public.workout_logs FOR DELETE
USING (user_id = auth.uid());

-- User goals policies
CREATE POLICY "Users can view own goals"
ON public.user_goals FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own goals"
ON public.user_goals FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
ON public.user_goals FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
ON public.user_goals FOR DELETE
USING (user_id = auth.uid());
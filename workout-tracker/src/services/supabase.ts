import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---------- Auth ----------
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// ---------- Workout Logs ----------
export const logWorkout = async (workoutData: {
  user_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  unit: string;
  notes?: string;
  performed_at: string;
}) => {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert([workoutData])
    .select();
  return { data, error };
};

export const getWorkoutHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('performed_at', { ascending: false });
  return { data, error };
};

export const getLastWorkoutForExercise = async (userId: string, exerciseName: string) => {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('performed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
};

// ---------- User Goals ----------
export const setUserGoal = async (goalData: {
  user_id: string;
  goal_type: string;
  target_description: string;
  target_value?: number;
}) => {
  const { data, error } = await supabase
    .from('user_goals')
    .insert([goalData])
    .select();
  return { data, error };
};

export const getUserGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);
  return { data, error };
};
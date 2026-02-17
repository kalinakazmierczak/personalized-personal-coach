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
    .eq('is_active', true)
    .order('priority', { ascending: false });
  return { data, error };
};

export const updateGoal = async (goalId: string, updates: Partial<{
  target_description: string;
  target_value: number;
  target_date: string;
  current_progress: number;
  is_active: boolean;
  priority: number;
}>) => {
  const { data, error } = await supabase
    .from('user_goals')
    .update(updates)
    .eq('id', goalId)
    .select();
  return { data, error };
};

export const deleteGoal = async (goalId: string) => {
  const { error } = await supabase
    .from('user_goals')
    .delete()
    .eq('id', goalId);
  return { error };
};

// ---------- Chat Messages ----------
export const getChatMessages = async (userId: string, limit: number = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return { data, error };
};

export const saveChatMessage = async (messageData: {
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
}) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([messageData])
    .select()
    .single();
  return { data, error };
};

export const updateMessageFeedback = async (messageId: string, feedback: 'up' | 'down') => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ feedback })
    .eq('id', messageId);
  return { error };
};

export const clearChatHistory = async (userId: string) => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', userId);
  return { error };
};
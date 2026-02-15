import { useEffect, useState, useCallback } from 'react';
import { WorkoutLog } from '../types';
import { supabase } from '../services/supabase';
import useAuth from './useAuth';

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('performed_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setWorkoutLogs((data as WorkoutLog[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  const logWorkout = useCallback(async (workout: {
    exercise_name: string;
    sets: number;
    reps: number;
    weight: number;
    unit: 'lbs' | 'kg';
    notes?: string;
  }) => {
    if (!user) return;
    setError(null);

    const { error: insertError } = await supabase
      .from('workout_logs')
      .insert([{
        ...workout,
        user_id: user.id,
        performed_at: new Date().toISOString(),
      }]);

    if (insertError) {
      setError(insertError.message);
      return false;
    }

    await fetchWorkoutLogs();
    return true;
  }, [user, fetchWorkoutLogs]);

  useEffect(() => {
    fetchWorkoutLogs();
  }, [fetchWorkoutLogs]);

  return {
    workoutLogs,
    loading,
    error,
    logWorkout,
    fetchWorkoutLogs,
  };
};
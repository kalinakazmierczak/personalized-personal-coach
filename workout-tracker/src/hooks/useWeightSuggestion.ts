import { useEffect, useState, useCallback } from 'react';
import { getLastWorkoutForExercise } from '../services/supabase';
import { WEIGHT_INCREMENT } from '../constants';
import useAuth from './useAuth';

interface WeightSuggestionResult {
  suggestedWeight: number | null;
  lastWeight: number | null;
  lastReps: number | null;
  loading: boolean;
}

const useWeightSuggestion = (exerciseName: string): WeightSuggestionResult => {
  const { user } = useAuth();
  const [suggestedWeight, setSuggestedWeight] = useState<number | null>(null);
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [lastReps, setLastReps] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = useCallback(async () => {
    if (!user || !exerciseName) return;

    setLoading(true);
    const { data, error } = await getLastWorkoutForExercise(user.id, exerciseName);

    if (!error && data) {
      setLastWeight(data.weight);
      setLastReps(data.reps);
      // If they completed all reps last time, suggest increasing weight
      setSuggestedWeight(data.weight + WEIGHT_INCREMENT);
    } else {
      setSuggestedWeight(null);
      setLastWeight(null);
      setLastReps(null);
    }
    setLoading(false);
  }, [user, exerciseName]);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  return { suggestedWeight, lastWeight, lastReps, loading };
};

export default useWeightSuggestion;
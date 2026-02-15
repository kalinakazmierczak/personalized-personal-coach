export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const calculateTotalVolume = (
  sets: number,
  reps: number,
  weight: number
): number => {
  return sets * reps * weight;
};

export const getSmartWeightSuggestion = (lastWeight: number, increment: number = 5): number => {
  return Math.round((lastWeight + increment) * 100) / 100;
};

export const isValidWorkoutInput = (
  exercise: string,
  sets: number,
  reps: number,
  weight: number
): boolean => {
  return exercise.trim().length > 0 && sets > 0 && reps > 0 && weight >= 0;
};

export const groupWorkoutsByDate = <T extends { performed_at: string }>(
  workouts: T[]
): Record<string, T[]> => {
  return workouts.reduce((groups, workout) => {
    const date = formatDate(workout.performed_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {} as Record<string, T[]>);
};
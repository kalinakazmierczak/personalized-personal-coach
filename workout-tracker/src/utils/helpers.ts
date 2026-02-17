import { startOfWeek, endOfWeek, isAfter, subDays, subMonths, format, isSameDay } from 'date-fns';
import { WorkoutLog, WeekSection, DayGroup, HistoryFilter } from '../types';

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

// Filter workouts by time range
export const filterWorkouts = (logs: WorkoutLog[], filter: HistoryFilter): WorkoutLog[] => {
  const now = new Date();
  switch (filter) {
    case '7days':
      return logs.filter((l) => isAfter(new Date(l.performed_at), subDays(now, 7)));
    case '30days':
      return logs.filter((l) => isAfter(new Date(l.performed_at), subDays(now, 30)));
    case '3months':
      return logs.filter((l) => isAfter(new Date(l.performed_at), subMonths(now, 3)));
    default:
      return logs;
  }
};

// Group workouts into weekly sections for SectionList
export const groupWorkoutsByWeek = (logs: WorkoutLog[]): WeekSection[] => {
  const weekMap: Record<string, { start: Date; end: Date; logs: WorkoutLog[] }> = {};

  logs.forEach((log) => {
    const d = new Date(log.performed_at);
    const wStart = startOfWeek(d, { weekStartsOn: 1 });
    const wEnd = endOfWeek(d, { weekStartsOn: 1 });
    const key = format(wStart, 'yyyy-MM-dd');
    if (!weekMap[key]) {
      weekMap[key] = { start: wStart, end: wEnd, logs: [] };
    }
    weekMap[key].logs.push(log);
  });

  // Sort weeks descending
  const sortedKeys = Object.keys(weekMap).sort((a, b) => b.localeCompare(a));

  return sortedKeys.map((key) => {
    const { start, end, logs: weekLogs } = weekMap[key];
    const weekLabel = `week of ${format(start, 'MMM d').toLowerCase()}`;
    const dateRange = `${format(start, 'MMM d').toLowerCase()} – ${format(end, 'MMM d').toLowerCase()}`;

    const totalVolume = weekLogs.reduce(
      (sum, l) => sum + calculateTotalVolume(l.sets, l.reps, l.weight),
      0
    );
    const allExercises = [...new Set(weekLogs.map((l) => l.exercise_name))];

    // Group by day+category within the week
    const dayMap: Record<string, DayGroup> = {};
    weekLogs.forEach((log) => {
      const dayKey = format(new Date(log.performed_at), 'yyyy-MM-dd') + '|' + (log.category || 'custom');
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = {
          date: formatDate(log.performed_at),
          category: log.category || 'custom',
          exercises: '',
          totalSets: 0,
          logs: [],
        };
      }
      dayMap[dayKey].logs.push(log);
      dayMap[dayKey].totalSets += log.sets;
    });

    // Fill in exercise comma lists
    const dayGroups = Object.values(dayMap)
      .map((dg) => ({
        ...dg,
        exercises: [...new Set(dg.logs.map((l) => l.exercise_name))].join(', '),
      }))
      .sort((a, b) => {
        const da = new Date(a.logs[0].performed_at);
        const db = new Date(b.logs[0].performed_at);
        return db.getTime() - da.getTime();
      });

    // Count unique workout days
    const uniqueDays = new Set(weekLogs.map((l) => format(new Date(l.performed_at), 'yyyy-MM-dd')));

    return {
      weekLabel,
      dateRange,
      totalWorkouts: uniqueDays.size,
      totalVolume,
      exercises: allExercises,
      data: dayGroups,
    };
  });
};

// Check if weight increased compared to previous log of same exercise
export const getWeightDelta = (
  currentWeight: number,
  exerciseName: string,
  allLogs: WorkoutLog[],
  currentLogId: string
): number | null => {
  const previousLogs = allLogs.filter(
    (l) => l.exercise_name === exerciseName && l.id !== currentLogId
  );
  if (previousLogs.length === 0) return null;
  // allLogs should already be sorted descending
  const prevWeight = previousLogs[0].weight;
  if (currentWeight === prevWeight) return null;
  return currentWeight - prevWeight;
};

// Calculate streak from workout dates
export const calculateStreak = (logs: WorkoutLog[]): number => {
  if (logs.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get unique workout dates, sorted descending
  const uniqueDates = [
    ...new Set(
      logs.map((l) => {
        const d = new Date(l.performed_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    ),
  ].sort((a, b) => b - a);

  const latestDate = new Date(uniqueDates[0]);

  // If the latest workout isn't today or yesterday, streak is 0
  const diffFromToday = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = (uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Format seconds to mm:ss
export const formatTimer = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Days since last workout
export const daysSinceLastWorkout = (logs: WorkoutLog[]): number | null => {
  if (logs.length === 0) return null;
  const latest = new Date(logs[0].performed_at);
  const now = new Date();
  return Math.floor((now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));
};
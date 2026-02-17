export interface User {
  id: string;
  email: string;
  display_name: string | null;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
  preferred_notification_hour: number;
  preferred_notification_minute: number;
  notifications_enabled: boolean;
  rest_timer_seconds: number;
  rest_timer_auto_start: boolean;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_name: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  unit: 'lbs' | 'kg';
  notes: string | null;
  performed_at: string;
  created_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: 'strength' | 'endurance' | 'weight_loss' | 'muscle_gain' | 'general_fitness' | 'body_comp' | 'performance' | 'frequency';
  target_description: string;
  target_value: number | null;
  target_date: string | null;
  current_progress: number;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

export interface WorkoutFormData {
  exercise_name: string;
  sets: string;
  reps: string;
  weight: string;
  unit: 'lbs' | 'kg';
  notes: string;
}

// Weekly grouping for history
export interface WeekSection {
  weekLabel: string;
  dateRange: string;
  totalWorkouts: number;
  totalVolume: number;
  exercises: string[];
  data: DayGroup[];
}

export interface DayGroup {
  date: string;
  category: string;
  exercises: string;
  totalSets: number;
  logs: WorkoutLog[];
}

export type HistoryFilter = 'all' | '7days' | '30days' | '3months';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
};

// AI Coach
export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  feedback: 'up' | 'down' | null;
  created_at: string;
}

export interface CoachContext {
  workoutHistory: WorkoutLog[];
  goals: UserGoal[];
  streak: number;
  daysSinceLastWorkout: number | null;
  personalRecords: Record<string, number>;
  recentTrends: {
    exerciseName: string;
    weights: number[];
    dates: string[];
  }[];
}

export type CoachingStyle = 'encouraging' | 'strict' | 'casual';

export type TabParamList = {
  Today: undefined;
  History: undefined;
  Coach: undefined;
  Profile: undefined;
};
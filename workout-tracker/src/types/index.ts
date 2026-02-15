export interface User {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_name: string;
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
  goal_type: 'strength' | 'endurance' | 'weight_loss' | 'muscle_gain' | 'general_fitness';
  target_description: string;
  target_value: number | null;
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

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type TabParamList = {
  Today: undefined;
  History: undefined;
  Profile: undefined;
};
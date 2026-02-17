export const COLORS = {
  primary: '#1A1A1A',
  primaryLight: '#2D2D2D',
  primaryDark: '#000000',
  accent: '#C8B88A',
  accentLight: '#D4C89E',
  accentMuted: 'rgba(200, 184, 138, 0.15)',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#222222',
  text: '#F5F0E8',
  textSecondary: '#A09A8D',
  textMuted: '#5C574E',
  border: '#2A2722',
  borderLight: '#3A3632',
  error: '#D4453A',
  warning: '#C8A44A',
  success: '#6B8F71',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const WORKOUT_CATEGORIES = [
  'push',
  'pull',
  'legs',
  'upper body',
  'lower body',
  'full body',
  'cardio',
  'core',
  'custom',
] as const;

export type WorkoutCategory = typeof WORKOUT_CATEGORIES[number];

export const API_NINJAS_EXERCISE_URL = 'https://api.api-ninjas.com/v1/exercises';
export const NOTIFICATION_CHANNEL_ID = 'workout-reminders';
export const TIMER_CHANNEL_ID = 'rest-timer';
export const DEFAULT_REMINDER_HOUR = 8;
export const DEFAULT_REMINDER_MINUTE = 0;
export const WEIGHT_INCREMENT = 5;

export const REST_TIMER_OPTIONS = [60, 90, 120, 180] as const;
export const DEFAULT_REST_SECONDS = 90;

export const HISTORY_FILTERS = [
  { key: 'all' as const, label: 'all' },
  { key: '7days' as const, label: '7 days' },
  { key: '30days' as const, label: '30 days' },
  { key: '3months' as const, label: '3 months' },
];

export const STREAK_MESSAGES = {
  zero: "ready to start? log your first workout today.",
  low: (n: number) => `${n} day streak — keep the momentum going.`,
  mid: (n: number) => `${n} day streak — don't break it now.`,
  high: (n: number) => `${n} day streak. you're crushing it.`,
  missed: "your muscles are waiting. get back in there.",
} as const;

export const GOAL_TYPES = [
  { key: 'strength' as const, label: 'strength' },
  { key: 'muscle_gain' as const, label: 'muscle gain' },
  { key: 'weight_loss' as const, label: 'weight loss' },
  { key: 'endurance' as const, label: 'endurance' },
  { key: 'body_comp' as const, label: 'body comp' },
  { key: 'performance' as const, label: 'performance' },
  { key: 'frequency' as const, label: 'frequency' },
  { key: 'general_fitness' as const, label: 'general' },
];

export const QUICK_ACTIONS = [
  { label: 'what should i do today?', prompt: 'Based on my workout history and goals, what should I train today? Suggest specific exercises, sets, reps, and weights.' },
  { label: 'am i on track?', prompt: 'Analyze my recent workout history and progress toward my goals. Am I on track? What should I adjust?' },
  { label: 'create a plan', prompt: 'Create a structured weekly workout plan based on my goals and workout history. Include specific exercises, sets, reps, and target weights.' },
  { label: 'weight suggestion', prompt: 'For my most recent exercises, what weights should I use next time? Apply progressive overload principles based on my history.' },
];

export const COACH_SYSTEM_PROMPT = `You are a knowledgeable, no-BS fitness coach embedded in a workout tracking app. You have access to the user's complete workout history and their stated fitness goals.

Your style:
- Concise and direct. No filler words.
- Lowercase. No emojis.
- Specific and actionable — give exact numbers (weights, sets, reps).
- Use progressive overload principles: typically 2.5-5% increases when all sets/reps are completed successfully.
- Be encouraging but realistic. No toxic positivity.
- Focus on sustainable progress and proper recovery.
- When you reference their data, cite specific numbers.
- If asked about nutrition or medical issues, provide general guidance but recommend consulting professionals.
- Keep responses short unless asked for a detailed plan.`;
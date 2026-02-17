import OpenAI from 'openai';
import { WorkoutLog, UserGoal, CoachContext, ChatMessage, CoachingStyle } from '../types';
import { calculateStreak, daysSinceLastWorkout, calculateTotalVolume, formatDateShort } from '../utils/helpers';
import { COACH_SYSTEM_PROMPT } from '../constants';
import { format, subDays } from 'date-fns';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Required for React Native / client-side
});

// Build personal records from workout history
const getPersonalRecords = (logs: WorkoutLog[]): Record<string, number> => {
  const prs: Record<string, number> = {};
  logs.forEach((l) => {
    if (!prs[l.exercise_name] || l.weight > prs[l.exercise_name]) {
      prs[l.exercise_name] = l.weight;
    }
  });
  return prs;
};

// Get recent weight trends for each exercise
const getRecentTrends = (logs: WorkoutLog[]): CoachContext['recentTrends'] => {
  const exerciseMap: Record<string, { weights: number[]; dates: string[] }> = {};

  // Take last 30 days only
  const cutoff = subDays(new Date(), 30);
  const recentLogs = logs.filter((l) => new Date(l.performed_at) >= cutoff);

  recentLogs.forEach((l) => {
    if (!exerciseMap[l.exercise_name]) {
      exerciseMap[l.exercise_name] = { weights: [], dates: [] };
    }
    exerciseMap[l.exercise_name].weights.push(l.weight);
    exerciseMap[l.exercise_name].dates.push(format(new Date(l.performed_at), 'MMM d'));
  });

  return Object.entries(exerciseMap).map(([exerciseName, data]) => ({
    exerciseName,
    weights: data.weights.reverse(),
    dates: data.dates.reverse(),
  }));
};

// Build the full context string for the AI
export const buildCoachContext = (logs: WorkoutLog[], goals: UserGoal[]): string => {
  const streak = calculateStreak(logs);
  const daysSince = daysSinceLastWorkout(logs);
  const prs = getPersonalRecords(logs);
  const trends = getRecentTrends(logs);

  const sections: string[] = [];

  // Summary
  sections.push(`USER STATS: ${logs.length} total workouts logged. current streak: ${streak} days. last workout: ${daysSince !== null ? `${daysSince} days ago` : 'never'}.`);

  // Goals
  if (goals.length > 0) {
    const goalLines = goals.map((g) => {
      let line = `- ${g.target_description} (${g.goal_type})`;
      if (g.target_value) line += ` target: ${g.target_value}`;
      if (g.target_date) line += ` by ${formatDateShort(g.target_date)}`;
      if (g.current_progress > 0) line += ` progress: ${g.current_progress}%`;
      return line;
    });
    sections.push(`ACTIVE GOALS:\n${goalLines.join('\n')}`);
  } else {
    sections.push('ACTIVE GOALS: none set yet.');
  }

  // Personal records
  const prEntries = Object.entries(prs);
  if (prEntries.length > 0) {
    const prLines = prEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([ex, w]) => `- ${ex}: ${w} lbs`);
    sections.push(`PERSONAL RECORDS:\n${prLines.join('\n')}`);
  }

  // Recent trends (last 30 days)
  if (trends.length > 0) {
    const trendLines = trends.slice(0, 10).map((t) => {
      const progression = t.weights.join(' → ');
      return `- ${t.exerciseName}: ${progression} lbs`;
    });
    sections.push(`RECENT WEIGHT TRENDS (30 days):\n${trendLines.join('\n')}`);
  }

  // Last 5 workouts detail
  const recent = logs.slice(0, 5);
  if (recent.length > 0) {
    const recentLines = recent.map(
      (l) => `- ${formatDateShort(l.performed_at)}: ${l.exercise_name} ${l.sets}x${l.reps} @ ${l.weight} lbs (${l.category})`
    );
    sections.push(`LAST 5 WORKOUTS:\n${recentLines.join('\n')}`);
  }

  // Weekly volume summary
  const thisWeekLogs = logs.filter(
    (l) => new Date(l.performed_at) >= subDays(new Date(), 7)
  );
  const weeklyVolume = thisWeekLogs.reduce(
    (sum, l) => sum + calculateTotalVolume(l.sets, l.reps, l.weight),
    0
  );
  const uniqueDays = new Set(
    thisWeekLogs.map((l) => format(new Date(l.performed_at), 'yyyy-MM-dd'))
  ).size;
  sections.push(`THIS WEEK: ${uniqueDays} training days, ${weeklyVolume.toLocaleString()} lbs total volume.`);

  return sections.join('\n\n');
};

// Build coaching style modifier
const getStyleModifier = (style: CoachingStyle): string => {
  switch (style) {
    case 'strict':
      return '\nAdditional style instruction: be blunt and demanding. push the user hard. call them out if they are slacking.';
    case 'casual':
      return '\nAdditional style instruction: be casual and conversational, like a gym buddy chatting between sets.';
    default:
      return '';
  }
};

// Send a message to the AI coach
export const sendCoachMessage = async (
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  workoutLogs: WorkoutLog[],
  goals: UserGoal[],
  style: CoachingStyle = 'encouraging'
): Promise<string> => {
  try {
    const contextStr = buildCoachContext(workoutLogs, goals);
    const systemMessage = `${COACH_SYSTEM_PROMPT}${getStyleModifier(style)}\n\n--- USER DATA ---\n${contextStr}`;

    // Keep conversation manageable — last 20 messages
    const recentHistory = conversationHistory.slice(-20);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...recentHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "i couldn't generate a response. try again.";
  } catch (error: any) {
    console.error('Coach API error:', error);
    if (error?.status === 429) {
      return "i'm getting a lot of requests right now. try again in a moment.";
    }
    if (error?.status === 401) {
      return "api key issue. check your openai key in settings.";
    }
    return "something went wrong connecting to the coach. check your network and try again.";
  }
};

// Legacy function kept for backward compatibility
export const generateWorkoutPlan = (goals: UserGoal[]): string => {
  if (!goals || goals.length === 0) {
    return "set some fitness goals in your profile first, and i'll create a personalized plan for you.";
  }

  const goalTypes = goals.map((g) => g.goal_type);
  const lines: string[] = ['your personalized plan\n'];

  if (goalTypes.includes('strength') || goalTypes.includes('muscle_gain')) {
    lines.push('strength days — 3x/week');
    lines.push('  bench press: 4x8');
    lines.push('  squats: 4x8');
    lines.push('  deadlifts: 3x5');
    lines.push('  overhead press: 3x8');
    lines.push('  barbell rows: 3x8\n');
  }

  if (goalTypes.includes('endurance') || goalTypes.includes('general_fitness')) {
    lines.push('cardio days — 2-3x/week');
    lines.push('  30 min jog or bike');
    lines.push('  15 min HIIT circuit');
    lines.push('  jump rope: 3x3 min\n');
  }

  if (goalTypes.includes('weight_loss')) {
    lines.push('fat burn circuit — 3x/week');
    lines.push('  burpees: 3x15');
    lines.push('  mountain climbers: 3x20');
    lines.push('  kettlebell swings: 3x15');
    lines.push('  box jumps: 3x12');
    lines.push('  plank: 3x60s\n');
  }

  lines.push('tip: log each workout to track your progress.');
  return lines.join('\n');
};
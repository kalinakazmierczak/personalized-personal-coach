import { UserGoal } from '../types';

// Simple rule-based workout plan generator
// In production, you'd call an LLM API (OpenAI, etc.)
export const generateWorkoutPlan = (goals: UserGoal[]): string => {
  if (!goals || goals.length === 0) {
    return "Set some fitness goals in your profile first, and I'll create a personalized plan for you!";
  }

  const goalTypes = goals.map((g) => g.goal_type);
  const lines: string[] = ['🏋️ Your Personalized Workout Plan:\n'];

  if (goalTypes.includes('strength') || goalTypes.includes('muscle_gain')) {
    lines.push('💪 Strength Days (3x/week):');
    lines.push('  • Bench Press: 4x8');
    lines.push('  • Squats: 4x8');
    lines.push('  • Deadlifts: 3x5');
    lines.push('  • Overhead Press: 3x8');
    lines.push('  • Barbell Rows: 3x8\n');
  }

  if (goalTypes.includes('endurance') || goalTypes.includes('general_fitness')) {
    lines.push('🏃 Cardio Days (2-3x/week):');
    lines.push('  • 30 min jog or bike ride');
    lines.push('  • 15 min HIIT circuit');
    lines.push('  • Jump rope: 3x3 min rounds\n');
  }

  if (goalTypes.includes('weight_loss')) {
    lines.push('🔥 Fat Burn Circuit (3x/week):');
    lines.push('  • Burpees: 3x15');
    lines.push('  • Mountain Climbers: 3x20');
    lines.push('  • Kettlebell Swings: 3x15');
    lines.push('  • Box Jumps: 3x12');
    lines.push('  • Plank: 3x60s\n');
  }

  lines.push('📌 Tip: Log each workout to track your progress!');
  return lines.join('\n');
};
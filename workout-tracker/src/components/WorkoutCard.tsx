import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDate } from '../utils/helpers';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface WorkoutCardProps {
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
  category?: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ exercise, sets, reps, weight, date, category }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exercise}>{exercise}</Text>
        <Text style={styles.date}>{formatDate(date)}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{sets}</Text>
          <Text style={styles.statLabel}>sets</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{reps}</Text>
          <Text style={styles.statLabel}>reps</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{weight}</Text>
          <Text style={styles.statLabel}>lbs</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  exercise: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '400',
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.2,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '300',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '400',
    letterSpacing: 1.5,
  },
  statDivider: {
    width: 0.5,
    height: 24,
    backgroundColor: COLORS.border,
  },
});

export default WorkoutCard;
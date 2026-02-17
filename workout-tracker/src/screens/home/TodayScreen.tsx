import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import WorkoutForm from '../../components/WorkoutForm';
import RestTimer from '../../components/RestTimer';
import { useRestTimer } from '../../hooks/useRestTimer';
import { COLORS, SPACING, FONT_SIZES, WORKOUT_CATEGORIES, WorkoutCategory } from '../../constants';

const TodayScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>('push');
  const restTimer = useRestTimer();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).toLowerCase();

  const handleWorkoutLogged = () => {
    // Auto-start rest timer after logging a workout
    if (!restTimer.isRunning) {
      restTimer.start(restTimer.duration);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>{today}</Text>
          <View style={styles.headerRow}>
            <Text style={styles.greeting}>what are we hitting?</Text>
            {!restTimer.isVisible && (
              <TouchableOpacity
                style={styles.timerToggle}
                onPress={() => restTimer.show()}
              >
                <Text style={styles.timerToggleText}>timer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {WORKOUT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        <WorkoutForm category={selectedCategory} onWorkoutLogged={handleWorkoutLogged} />
      </ScrollView>

      {/* Floating Rest Timer */}
      <RestTimer
        remaining={restTimer.remaining}
        duration={restTimer.duration}
        isRunning={restTimer.isRunning}
        isFinished={restTimer.isFinished}
        isVisible={restTimer.isVisible}
        progress={restTimer.progress}
        onStart={restTimer.start}
        onPause={restTimer.pause}
        onResume={restTimer.resume}
        onReset={restTimer.reset}
        onSkip={restTimer.skip}
        onAddTime={restTimer.addTime}
        onDismiss={restTimer.dismiss}
        onSetDuration={restTimer.setDuration}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 3,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  timerToggle: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerToggleText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  categoryScroll: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.lg,
  },
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryPill: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 4,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  categoryPillText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  categoryPillTextActive: {
    color: COLORS.background,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
});

export default TodayScreen;
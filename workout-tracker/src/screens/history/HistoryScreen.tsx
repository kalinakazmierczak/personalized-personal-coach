import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useWorkouts } from '../../hooks/useWorkouts';
import WorkoutCard from '../../components/WorkoutCard';
import { WorkoutLog } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

const HistoryScreen = () => {
  const { workoutLogs, loading, error, fetchWorkoutLogs } = useWorkouts();

  const renderItem = useCallback(
    ({ item }: { item: WorkoutLog }) => (
      <WorkoutCard
        exercise={item.exercise_name}
        sets={item.sets}
        reps={item.reps}
        weight={item.weight}
        date={item.performed_at}
      />
    ),
    []
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyTitle}>No workouts yet</Text>
      <Text style={styles.emptySubtitle}>Log your first workout on the Today tab!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && workoutLogs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={workoutLogs}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchWorkoutLogs}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </View>
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
  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default HistoryScreen;
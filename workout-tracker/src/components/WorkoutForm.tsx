import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWorkouts } from '../hooks/useWorkouts';
import useWeightSuggestion from '../hooks/useWeightSuggestion';
import ExerciseSearch from './ExerciseSearch';
import WeightSuggestion from './WeightSuggestion';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { Exercise } from '../types';

const WorkoutForm = () => {
  const { logWorkout } = useWorkouts();
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { suggestedWeight } = useWeightSuggestion(exerciseName);

  const handleSelectExercise = (exercise: Exercise) => {
    setExerciseName(exercise.name);
  };

  const handleApplySuggestion = (w: number) => {
    setWeight(w.toString());
  };

  const handleSubmit = async () => {
    if (!exerciseName.trim() || !sets || !reps || !weight) {
      Alert.alert('Missing Fields', 'Please fill in exercise, sets, reps, and weight.');
      return;
    }

    setSubmitting(true);
    const success = await logWorkout({
      exercise_name: exerciseName.trim(),
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight),
      unit: 'lbs',
      notes: notes.trim() || undefined,
    });

    if (success) {
      Alert.alert('✅ Logged!', `${exerciseName} added.`);
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
      setNotes('');
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      {/* Exercise Search */}
      <ExerciseSearch onSelectExercise={handleSelectExercise} />

      {/* Selected exercise name */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Exercise</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Bench Press"
          placeholderTextColor={COLORS.textMuted}
          value={exerciseName}
          onChangeText={setExerciseName}
        />
      </View>

      {/* Weight suggestion */}
      {exerciseName.length > 0 && suggestedWeight && (
        <WeightSuggestion
          suggestedWeight={suggestedWeight}
          onApply={handleApplySuggestion}
        />
      )}

      {/* Numeric inputs row */}
      <View style={styles.row}>
        <View style={[styles.inputWrapper, styles.flex1]}>
          <Text style={styles.label}>Sets</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            value={sets}
            onChangeText={setSets}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.inputWrapper, styles.flex1]}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.inputWrapper, styles.flex1]}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="How did it feel?"
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Log Workout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  inputWrapper: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
});

export default WorkoutForm;
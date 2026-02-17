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
import { COLORS, SPACING, FONT_SIZES, WorkoutCategory } from '../constants';
import { Exercise } from '../types';

interface WorkoutFormProps {
  category: WorkoutCategory;
  onWorkoutLogged?: () => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ category, onWorkoutLogged }) => {
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
      Alert.alert('missing fields', 'please fill in exercise, sets, reps, and weight.');
      return;
    }

    setSubmitting(true);
    const success = await logWorkout({
      exercise_name: exerciseName.trim(),
      category,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight),
      unit: 'lbs',
      notes: notes.trim() || undefined,
    });

    if (success) {
      Alert.alert('logged', `${exerciseName} added to ${category}.`);
      setExerciseName('');
      setSets('');
      setReps('');
      setWeight('');
      setNotes('');
      onWorkoutLogged?.();
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <ExerciseSearch onSelectExercise={handleSelectExercise} />

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>exercise</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. bench press"
          placeholderTextColor={COLORS.textMuted}
          value={exerciseName}
          onChangeText={setExerciseName}
        />
      </View>

      {exerciseName.length > 0 && suggestedWeight && (
        <WeightSuggestion
          suggestedWeight={suggestedWeight}
          onApply={handleApplySuggestion}
        />
      )}

      <View style={styles.row}>
        <View style={[styles.inputWrapper, styles.flex1]}>
          <Text style={styles.label}>sets</Text>
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
          <Text style={styles.label}>reps</Text>
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
          <Text style={styles.label}>weight</Text>
          <TextInput
            style={styles.input}
            placeholder="lbs"
            placeholderTextColor={COLORS.textMuted}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="optional"
          placeholderTextColor={COLORS.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.submitText}>log exercise</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.lg,
  },
  inputWrapper: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '300',
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.md + 2,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default WorkoutForm;
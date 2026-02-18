import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchExercises } from '../services/exerciseApi';
import { Exercise } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface ExerciseSearchProps {
  value: string;
  onChangeValue: (text: string) => void;
  onSelectExercise: (exercise: Exercise) => void;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ value, onChangeValue, onSelectExercise }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedName, setSelectedName] = useState('');

  const handleSearch = useCallback(async () => {
    // Don't search if the current value matches what was just selected
    if (value === selectedName || value.length < 3) {
      if (value.length < 3) {
        setExercises([]);
        setShowResults(false);
      }
      return;
    }
    setLoading(true);
    const results = await searchExercises(value);
    setExercises(results);
    setShowResults(true);
    setLoading(false);
  }, [value, selectedName]);

  useEffect(() => {
    const delay = setTimeout(handleSearch, 500);
    return () => clearTimeout(delay);
  }, [handleSearch]);

  const handleSelect = (exercise: Exercise) => {
    setSelectedName(exercise.name);
    onSelectExercise(exercise);
    onChangeValue(exercise.name);
    setExercises([]);
    setShowResults(false);
  };

  const handleChangeText = (text: string) => {
    if (text !== selectedName) {
      setSelectedName('');
    }
    onChangeValue(text);
    if (text.length < 3) {
      setShowResults(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>exercise</Text>
      <TextInput
        style={styles.input}
        placeholder="search or type exercise..."
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={handleChangeText}
      />
      {loading && <ActivityIndicator size="small" color={COLORS.textMuted} style={styles.loader} />}
      {showResults && exercises.length > 0 && (
        <View style={styles.resultsList}>
          <FlatList
            data={exercises.slice(0, 5)}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>
                  {item.muscle} · {item.difficulty}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
  loader: {
    marginTop: SPACING.sm,
  },
  resultsList: {
    backgroundColor: COLORS.surface,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  resultItem: {
    padding: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  resultName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  resultMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default ExerciseSearch;
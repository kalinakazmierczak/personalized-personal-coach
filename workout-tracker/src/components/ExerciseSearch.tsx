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
  onSelectExercise: (exercise: Exercise) => void;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ onSelectExercise }) => {
  const [query, setQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.length < 3) {
      setExercises([]);
      return;
    }
    setLoading(true);
    const results = await searchExercises(query);
    setExercises(results);
    setShowResults(true);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    const delay = setTimeout(handleSearch, 500);
    return () => clearTimeout(delay);
  }, [handleSearch]);

  const handleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise);
    setQuery('');
    setExercises([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🔍 Search Exercises</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name (e.g. squat)..."
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (text.length < 3) setShowResults(false);
        }}
      />
      {loading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />}
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
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
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
  loader: {
    marginTop: SPACING.sm,
  },
  resultsList: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  resultItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  resultMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});

export default ExerciseSearch;
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface WeightSuggestionProps {
  suggestedWeight: number;
  onApply: (weight: number) => void;
}

const WeightSuggestion: React.FC<WeightSuggestionProps> = ({ suggestedWeight, onApply }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>💡 Suggested Weight</Text>
        <Text style={styles.weight}>{suggestedWeight} lbs</Text>
        <Text style={styles.hint}>Based on your last workout</Text>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={() => onApply(suggestedWeight)}>
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  weight: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 2,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  applyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
});

export default WeightSuggestion;
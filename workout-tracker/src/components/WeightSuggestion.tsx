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
        <Text style={styles.label}>suggested weight</Text>
        <Text style={styles.weight}>{suggestedWeight} lbs</Text>
        <Text style={styles.hint}>based on your last session</Text>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={() => onApply(suggestedWeight)}>
        <Text style={styles.applyText}>apply</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.accentMuted,
    padding: SPACING.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  weight: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '200',
    color: COLORS.text,
    marginVertical: 2,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  applyButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  applyText: {
    color: COLORS.accent,
    fontWeight: '500',
    fontSize: FONT_SIZES.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default WeightSuggestion;